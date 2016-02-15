'use strict';

var socketio = require('socket.io'),
  express = require('express'),
  http = require('http'),
  mongojs = require('mongojs'),
  redis = require('redis'),
  ioredis = require('socket.io-redis');

var Class = require('mixin-pro').createClass;
var User = require('./models/user.js');

var _instances = {};

var LoginServer = Class({
  constructor: function LoginServer( conf ) {
    this.conf = conf;
    this.DROP_KICK_TIME = 30; // 30 sec
    this.reset();
  },

  reset: function() {
    this.io = null;
    this.db = null;
    this.dbusers = null;
    this.cache = null;
    this.pub = null;
    this.sub = null;
    this.id = 0;
    this.timer = 0;
    this.isRunning = false;
    this.sockets = {};  // sid -> socket
    this.socketsCount = 0;
    this.users = {};   // uid -> user
    this.usersCount = 0;
    this.dropped = {};
  },

  startup: function() {
    if(this.isRunning) throw new Error('server is already running.');

    this.db = mongojs(this.conf.mongodb);
    this.dbusers = this.db.collection('users');

    // init user id sequence if not exists
    this.initSeqId('userid', 1001);

    var redisConf = this.conf.redis;

    // use redis as data storage
    this.cache = redis.createClient(redisConf.port, redisConf.host, {});
    this.cache.on('error', function(err) {
      throw new Error('cache redis eror: ' + err);
    });

    // use redis pub/sub feature as message hub
    this.pub = redis.createClient(redisConf.port, redisConf.host, {});
    this.pub.on('error', function(err) {
      throw new Error('pub redis eror: ' + err);
    });
    this.sub = redis.createClient(redisConf.port, redisConf.host, {});
    this.sub.on('error', function(err) {
      throw new Error('pub redis eror: ' + err);
    });

    // we use configured instanceId,
    // in real cloud, we will get instanceId from env
    this.startInstance(this.conf.instanceId);
  },

  initSeqId: function(name, value) {
    var sequences = this.db.collection('sequences');
    sequences.find({_id: name}).count(function(err, n){
      if(n === 0) {
        sequences.insert({ _id:name, seq: value });
      }
    });
  },

  nextSeqId: function(name, callback) {
    var sequences = this.db.collection('sequences');
    sequences.findAndModify({
      query: { _id: name },
      update: { $inc: { seq: 1 } },
      new: true,
    }, function(err, doc, lastErrorObject){
      if(typeof callback === 'function') callback(err, doc.seq);
    });
  },

  startInstance: function(instanceId) {
    this.id = instanceId;

    var self = this;
    var conf = this.conf;
    var redisCache = this.cache;
    var now = Date.now();

    // init userver instance info & expire in 5 seconds,
    // we have to update it every 5 seconds, as heartbeat info
    var key = 'server:#' + instanceId;
    redisCache.multi().mset(key, {
      id: instanceId,
      started: now,
      users: 0,
    }).expire(key, 5).zadd('server:all', now, instanceId).exec();

    // init network listener
    var app = express().use(express.static(conf.www));
    var httpserver = http.createServer(app);
    var io = this.io = socketio.listen(httpserver);
    io.adapter(ioredis({
      host: conf.redis.host,
      port: conf.redis.port,
    }));
    io.on('connection', function(socket){
      self.onConnected(socket);
    });
    httpserver.listen(conf.server.port, conf.server.host, function(){
      console.log('listening on ' + conf.server.host + ':' + conf.server.port);
    });

    // init listener for message hub
    var sub = this.sub;
    sub.on('subscribe', function(channel, count){
      console.log('subscribed to: ' + channel + ', ' + count);
    });
    sub.on('message', function(channel, message){
      // console.log(channel, message);
      var words = channel.split('#');
      switch(words[0]) {
      case 'server:':
        self.onMessage(message);
        break;
      case 'user:':
        var uid = words[1];
        if(uid) {
          var user = self.users[uid];
          if(user) user.onMessage(message);
        }
        break;
      }
    });
    sub.subscribe('server:#' + instanceId);

    _instances[instanceId] = this;
    this.isRunning = true;
    this.pub.publish('server:log', 'server #' + instanceId + ' started');

    // init tick() timer
    self.tick();
    self.timer = setInterval(function(){
      self.tick();
    }, 1000);
  },

  shutdown: function() {
    if(!this.isRunning) return;

    // clear tick() timer
    if(this.timer) clearInterval(this.timer);

    // clear server entry in redisCache
    var redisCache = this.cache;
    redisCache.multi().del('server:#' + this.id).zrem('server:all', this.id).exec(function(){
      redisCache.quit();
    });

    // close socket connection
    if(this.io) this.io.close();

    // kick all connected users
    var users = this.users;
    for(var i in users) {
      users[i].onDrop();
      delete users[i];
    }

    // close all connections
    var sockets = this.sockets;
    for(var j in sockets) {
      sockets[j].disconnect();
      delete sockets[j];
    }

    this.pub.publish('server:log', 'server #' + this.id + ' stopped');

    this.sub.unsubscribe();
    this.sub.end();
    this.pub.end();
    this.cache.end();

    this.db.close();

    delete _instances[this.id];
    this.reset();
  },

  tick: function() {
    var self = this;
    var users = this.users;
    var dropped = this.dropped;

    var now = Date.now();
    if(this.cache && this.id) {
      var key = 'server:#' + this.id;
      this.cache.multi()
        .hset(key, 'users', self.usersCount).expire(key, 5)
        .zremrangebyscore('server:all', 0, now-5000)
        .zadd('server:all', now, this.id)
        .exec();
    }

    for(var i in dropped) {
      if(dropped[i] -- <= 0) {
        delete dropped[i];
        var user = users[i];
        if(user) {
          self.logoutUser(user);
        }
      }
    }
  },

  removeDropped: function(uid) {
    delete this.dropped[uid];
  },

  // message receive from message hub
  onMessage: function(msg) {
    console.log('login-server onMessage: ' + msg);
  },

  onConnected: function(sock) {
    var server = this;

    if(this.logTraffic) {
      // console.log('client connected, socket id: ' + sock.id);
      sock.logTraffic = 1;
    }

    sock.users = {};
    sock.usersCount = 0;

    sock.emit('hello', {
      sid: sock.id,
      hello_msg: this.conf.server.hello_msg,
      version: this.conf.server.version,
      'client_req': this.conf.server.client_req,
    });

    sock.emit('notify', {
      uid: null,
      e: 'prompt',
      args: {
        tips: 'please login, or signup',
        cmds: {
          login: {
            uid: 'string',
            passwd: 'string',
          },
          signup: {
            uid: 'string',
            passwd: 'string',
            name: 'string',
            //email: 'email',
            //phone: 'string',
            //uuid: 'string',
          },
          fastsignup: true,
        },
      },
    });

    sock.on('rpc', function(req){ // remote call
      // console.log(req);
      // common callback to send return message for RPC call
      var reply = function(err, ret) {
        return sock.emit('reply', { // reply to remote call
          seq: req.seq,
          err: err,
          ret: ret,
        });
      };

      if(typeof req !== 'object' || typeof req.f !== 'string') return reply(400, 'invalid rpc req');

      var funcName = 'onUserRpc' + req.f;
      var method = server[funcName];
      if(typeof method === 'function') {
        method.call(server, sock, req, reply);
      } else {
        var user = sock.users[ req.uid ];
        if(!user || user.pin !== req.pin) return reply(403, 'invalid uid or pin, login required');

        method = user[funcName];
        if(typeof method === 'function') {
          method.call(user, req, reply);
        } else if(user.world) {
          var worldkey = 'world:#' + user.world;
          server.pub.publish(worldkey, JSON.stringify(req));
        } else {
          return reply(404, 'user rpc method not defined: ' + funcName);
        }
      }
    });

    sock.on('disconnect', function(){
      server.onDisconnected(sock);
    });

    server.sockets[sock.id] = sock;
    server.socketsCount ++;
  },

  onDisconnected: function(sock) {
    var server = this;
    var now = Date.now();
    var pub = server.pub;
    var users = sock.users;
    if(users) {
      for(var uid in users) {
        var str = 'user (' + uid + ') drop offline';
        console.log(str);
        pub.publish('user:log', str);
        var user = users[uid];
        if(user) {
          server.dropped[uid] = server.DROP_KICK_TIME;
          user.onDrop();
          user.socket = null;
        }
        this.cache.zadd('user:dropped', now, uid);
      }
      sock.users = {};
    }
    delete server.sockets[ sock.id ];
    server.socketsCount --;
  },

  // args: {}
  onUserRpcfastsignup: function(sock, req, reply) {
    var server = this;
    var args = req.args = {};
    this.nextSeqId('userid', function(err, ret) {
      if(err) reply(500, 'db error');
      if(err) reply(500, 'db error');
      args.uid = 'u' + ret;
      args.name = args.uid;
      args.passwd = ''+(100000 + Math.floor(Math.random() * 899999));
      server.signupUser(sock, req, reply);
    });
  },

  // args: { uid, passwd, name, phone, email, uuid }
  onUserRpcsignup: function(sock, req, reply) {
    var args = req.args;
    if(!args || typeof args !== 'object') return reply(400, 'bad request');
    var uid = args.uid;
    if(!uid || typeof uid !== 'string' || uid.length < 3) return reply(400, 'invalid uid, must be >= 3 letters');
    this.signupUser(sock, req, reply);
  },

  // args: { uid, passwd }
  onUserRpclogin: function(sock, req, reply) {
    var server = this;
    var redisCache = this.cache;

    var args = req.args;
    if(!args || typeof args !== 'object') return reply(400, 'bad request');

    var uid = args.uid;
    server.dbusers.findOne({ uid: uid }, function(err, userinfo) {
      // console.log(userinfo);
      // validate login
      if(err) return reply(500, 'db error');
      if(!userinfo) return reply(404, 'user not exists');
      if(userinfo.passwd !== args.passwd) return reply(403, 'invalid user id or password');

      // create user object
      var user = server.users[uid];
      if(!user) {
        user = new User(uid);
        server.users[uid] = user;
        server.usersCount ++;
        server.sub.subscribe('user:#' + uid);
      }
      user.setProfile(userinfo);

      var now = Date.now();
      var pin = Math.floor((0.1 + Math.random()) * now);

      // link sock to user object
      var isRelogin = false;
      var sameSock = false;
      if(user.socket) {
        isRelogin = true;
        if(user.socket.id === sock.id) {
          sameSock = true;
        } else {
          user.push('bye', 'replaced by another login');
          user.removeLink();
          user.setLink(server, sock, pin);
        }
      } else {
        user.setLink(server, sock, pin);
      }

      server.dbusers.update({ uid: uid }, { $set: { lastLogin: now } });

      redisCache.zadd('user:online', now, uid);

      // send reply with pin
      reply(0, {
        token : {
          uid : user.uid,
          pin : user.pin,
        },
        profile : user.getProfile(),
        cmds : {
          fastsignup: null,
          signup: null,
          login: null,
          // logout: true,
        },
      });

      if(!sameSock) {
        if(isRelogin) {
          user.onReconnect(req);
        } else {
          redisCache.zscore('user:dropped', uid, function(err, ret){
            if(err) return reply(500, 'redisCache error');
            if(ret) {
              redisCache.zrem('user:dropped', uid);
              user.onReconnect(req);
            } else {
              user.onLogin(req);
            }
          });
        }
      }
    });
  },

  onUserRpclogout: function(sock, req, reply) {
    var uid = req.uid;
    var users = sock.users;
    if(!uid || !users) return reply(400, 'invalid request');

    var user = users[uid];
    if(!user || user.pin !== req.pin) return reply(403, 'access denied');

    reply(0, {
      cmds: {
        entergame : null,
        logout : null,
        fastsignup: true,
        signup : {
          uid : 'string',
          passwd : 'string',
//          name : 'string',
//          email : 'email',
//          phone : 'string',
//          uuid : 'string',
        },
        login : {
          uid : 'string',
          passwd : 'string',
        },
      },
    });

    this.logoutUser(user);
  },

  signupUser: function(sock, req, reply) {
    var server = this;
    if(!req || !req.args || !req.args.uid) return reply(400, 'invalid request, uid required');

    var uid = req.args.uid;
    this.dbusers.find({ uid: uid }).count(function(err, n) {
      if(err) return reply(500, 'db error');
      if(n > 0) return reply(409, 'user id ' + uid + ' already exits');
      server.createNewUser(sock, req, reply);
    });
  },

  createNewUser: function(sock, req, reply) {
    var server = this;
    var args = req.args;

    var userRecord = {
      uid: args.uid,
      name: args.name,
      passwd: args.passwd,
      uuid: args.uuid || '',
      phone: args.phone || '',
      email: args.email || '',
      phoneValidated: 0,
      emailValidated: 0,
      avatar: '',
      createdAt: Date.now(),
      lastLogin: 0,
      coins: 0,
    };

    // copy default data for new user if configured
    var newUserConf = server.conf.new_user;
    if(newUserConf) {
      for(var i in newUserConf) {
        userRecord[i] = newUserConf[i];
      }
    }

    var uid = req.args.uid;
    this.dbusers.insert(userRecord, function(err, doc){
      console.log(err, doc);
      if(err) return reply(500, 'db error');
      return reply(0, { uid:uid, passwd: args.passwd });
    });
  },

  logoutUser: function(user) {
    if(!user) return;

    user.onLogout();
    user.notify('bye', 'logout');
    user.removeLink();

    var uid = user.uid;
    this.cache.zrem('user:online', uid);

    this.sub.unsubscribe('user:#' + uid);
    delete this.users[uid];
    this.usersCount --;
    this.pub.publish('user:log', 'user (' + uid + ') logout');
  },
});

exports = module.exports = LoginServer;
