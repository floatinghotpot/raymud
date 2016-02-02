'use strict';

const Class = require('mixin-pro').createClass;

const path = require('path'),
      socketio = require('socket.io'),
      express = require('express'),
      http = require('http'),
      redis = require('redis'),
      iosredis = require('socket.io-redis');

import { User } from './user.js;'

const _instances = {};

export const LoginServer = Class({
  constructor: function LoginServer( conf ) {
    this.conf = conf;
    this.DROP_KICK_TIME = 30; // 30 sec
    this.reset();
  },

  reset: function() {
    this.io = null;
    this.db = null;
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

    const redis_conf = this.conf.redis;

    // use redis as data storage
    this.db = redis.createClient(redis_conf.port, redis_conf.host, {});
    this.db.on('error', function(err) {
      console.log('db redis eror: ' + err);
    });

    // use redis pub/sub feature as message hub
    this.pub = redis.createClient(redis_conf.port, redis_conf.host, {});
    this.pub.on('error', function(err) {
      console.log('pub redis eror: ' + err);
    });
    this.sub = redis.createClient(redis_conf.port, redis_conf.host, {});
    this.sub.on('error', function(err) {
      console.log('pub redis eror: ' + err);
    });

    const self = this;
    this.db.incr('server:seq', function(err, instanceId){
      if(err) return;
      self.startInstance(instanceId);
    });
  },

  startInstance: function(instanceId) {
    this.id = instanceId;

    const self = this;
    const conf = this.conf;
    const db = this.db;
    const now = Date.now();

    // init userver instance info & expire in 5 seconds,
    // we have to update it every 5 seconds, as heartbeat info
    const key = 'server:#' + instanceId;
    db.multi().mset(key, {
      id: instanceId,
      started: now,
      users: 0,
    }).expire(key, 5).zadd('server:all', now, instanceId).exec();

    // init user id sequence if not exists
    db.get('user:seq', function(err, ret) {
      if(err) return;
      if(!ret || ret<1000) db.set('user:seq', 1000);
    });

    // init network listener
    const app = express().use(express.static(conf.www));
    const httpserver = http.createServer(app);
    const io = this.io = socketio.listen(httpserver);
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

    // init tick() timer
    self.timer = setInterval(function(){
      self.tick();
    }, 1000);

    // init listener for message hub
    const sub = this.sub;
    sub.on('subscribe', function(channel, count){});
    sub.on('message', function(channel, message){
      var words = channel.split('#');
      switch(words[0]) {
        case 'server':
          self.onMessage(message);
          break;
        case 'user':
          const uid = words[1];
          if(uid) {
            const user = self.users[uid];
            if(user) user.onMessage(message);
          }
          break;
      }
    });
    sub.subscribe('server:#' + instanceId);

    _instances[instanceId] = this;
    this.isRunning = true;
    this.pub.publish('server:log', 'server #' + instanceId + ' started');
  },

  shutdown: function() {
    if(!this.isRunning) return;

    // clear tick() timer
    if(this.timer) clearInterval(this.timer);

    // clear server entry in db
    const db = this.db;
    db.multi().del('server:#' + this.id).zrem('server:all', this.id).exec(function(err, ret){
      db.quit();
    });

    // close socket connection
    if(this.io) this.io.close();

    // kick all connected users
    const users = this.users;
    for(const i in users) {
      users[i].onDrop();
      delete users[i];
    }

    // close all connections
    const sockets = this.sockets;
    for(const i in sockets) {
      sockets[i].disconnect();
      delete sockets[i];
    }

    this.pub.publish('server:log', 'server #' + this.id + ' stopped');

    this.sub.unsubscribe();
    this.sub.end();
    this.pub.end();
    this.db.end();

    delete _instances[this.id];
    this.reset();
  },

  tick: function() {
    const self = this;
    const users = this.users;
    const dropped = this.dropped;

    if(this.db && this.id) {
      const key = 'server:#' + this.id;
      this.db.multi()
        .hset(key, 'users', self.usersCount).expire(key, 5)
        .zremrangebyscore('server:all', 0, Date.now()-5000)
        .zadd('server:all', now, this.id)
        .exec();
    }

    for(var i in dropped) {
      if(dropped[i] -- <= 0) {
        delete dropped[i];
        const user = users[i];
        if(user) {
          self.logoutUser(user);
        }
      }
    }
  },

  removeDropped: function(uid) {
    delete this.dropped[uid];
  },

  onMessage: function(msg) {
    console.log('server onMessage: ' + msg);
  },

  onConnected: function(sock) {
    const server = this;

    if(this.logTraffic) {
      console.log('client connected, socket id: ' + sock.id);
      sock.logTraffic = 1;
    }

    sock.users = {};
    sock.usersCount = 0;

    sock.emit('hello', {
      sid: sock.id,
      msg: this.conf.server.hellomsg,
      version: this.conf.server.version,
      client_req: this.conf.server.client_req,
    });

    sock.on('hello', function(req){
      sock.emit('notify', {
        uid: null,
        e: 'prompt',
        args: {
          fastsignup: true,
          signup: {
            uid: 'string',
            passwd: 'string',
            name: 'string',
            email: 'email',
            phone: 'string',
            uuid: 'string',
          },
          login: {
            uid: 'string',
            passwd: 'string'
          },
        },
      });
    });

    sock.on('rpc', function(req){ // remote call
      // common callback to send return message for RPC call
      const reply = function(err, ret) {
        return sock.emit('reply', { // reply to remote call
          seq: req.seq,
          err: err,
          ret: ret,
        });
      }

      if(typeof req !== 'object' || typeof req.f !== 'string') return reply(400, 'invalid rpc req');

      const funcName = 'onUser_' + req.f;
      let method = server[funcName];
      if(typeof method == 'function') {
        method.call(server, sock, req);
      } else {
        const user = sock.users[ req.uid ];
        if(!user || user.pin !== req.pin) return reply(403, 'invalid uid or pin, login required');

        method = user[funcName];
        if(typeof method === 'function') {
          method.call(user, req, reply);
        } else {
          if(user.world) {
            var worldkey = 'world:#' + user.world;
            req.f = 'rpc';
            server.pub.publish(worldkey, JSON.stringify(req);
          } else
            return reply(404, 'user RPC not defined: ' + funcName);
        }
      }

      sock.on('disconnect', function(){
        server.onDisconnected(sock);
      });

      server.sockets[sock.id] = sock;
      server.socketsCount ++;
    });
  },

  onDisconnected: function(sock) {
    const server = this;
    const now = Date.now();
    const pub = server.pub;
    const users = sock.users;
    if(users) {
      for(const uid in users) {
        pub.publish('user:log', 'user (' + uid + ') drop offline');
        const user = users[uid];
        if(user) {
          server.dropped[uid] = server.DROP_KICK_TIME;
          user.onDrop();
          user.socket = null;
        }
        this.db.zadd('user:dropped', now, uid);
      }
      sock.users = {};
    }
    delete server.sockets[ sock.id ];
    server.socketsCount --;
  },

  // args: {}
  onUser_fastsignup: function(sock, req, reply) {
    const server = this;
    const args = req.args = {};
    this.db.incr('user:seq', function(err, ret){
      if(err) reply(500, 'db error');
      args.uid = 'u' + ret;
      args.name = args.uid;
      args.passwd = (100000 + Math.floor(Math.random() * 899999));
      server.signupUser(sock, req, reply);
    });
  },

  // args: { uid, passwd, name, phone, email, uuid }
  onUser_signup: function(sock, req, reply) {
    const args = req.args;
    if(!args || typeof args !== 'object') return reply(400, 'bad request');
    const uid = args.uid;
    if(!uid || typeof uid !== 'string' || uid.length < 3) return reply(400, 'invalid uid, must be >= 3 letters');
    this.signupUser(sock, req, reply);
  },

  // args: { uid, passwd }
  onUser_login: function(sock, req, reply) {
    const server = this;
    const db = this.db;

    const args = req.args;
    if(!args || typeof args !== 'object') return reply(400, 'bad request');

    const uid = args.uid;
    const uidkey = 'user:#' + uid;
    db.hgetall(uidkey, function(err, userinfo){
      // validate login
      if(err) return reply(500, 'db error');
      if(!userinfo) return reply(404, 'user not exists');
      if(userinfo.passwd !== args.passwd) return reply(403, 'invalid user id or password');

      // create user object
      let user = server.users[uid];
      if(!user) {
        user = new User(uid);
        server.users[uid] = user;
        server.usersCount ++;
        server.sub.subscribe('user:#' + uid);
      }
      user.setProfile(userinfo);

      const now = Date.now();
      const pin = Math.floor((0.1 + Math.random()) * now);

      // link sock to user object
      let isRelogin = false;
      let sameSock = false;
      if(user.socket) {
        isRelogin = true;
        if(user.socket.id === sock.id) {
          sameSock = true;
        } else {
          user.push('bye', 'replaced by another login');
          user.removeLink();
          user.setLink(server, sock pin);
        }
      } else {
        user.setLink(server, sock, pin);
      }

      // send reply with pin
      db.multi().hset(uidkey, 'lastLogin', now).zadd('user:online', now, uid).exec();
      reply(0, {
        token : {
          uid : user.uid,
          pin : user.pin
        },
        profile : user.getProfile(),
        cmds : {
          fastsignup: null,
          signup: null,
          login: null,
          logout: true
        }
      });

      if(!sameSock) {
        if(isRelogin) {
          user.onReconnect(req);
        } else {
          db.zscore('user:dropped', uid, function(err, ret){
            if(err) return reply(500, 'db error');
            if(ret) {
              db.zrem('user:dropped', uid);
              user.onReconnect(req);
            } else {
              user.onLogin(req);
            }
          });
        }
      }
    });
  },

  onUser_logout: function(sock, req, reply) {
    const uid = req.uid;
    const users = sock.users;
    if(!uid || !users) return reply(400, 'invalid request');

    const user = users[uid];
    if(!user || user.pin !=== req.pin) return reply(403, 'access denied');

    reply(0, {
      cmds: {
        entergame : null,
        logout : null,
        fastsignup: true,
        signup : {
          uid : 'string',
          passwd : 'string',
          name : 'string',
          email : 'email',
          phone : 'string',
          uuid : 'string'
        },
        login : {
          uid : 'string',
          passwd : 'string'
        }
      },
    });

    this.logoutUser(user);
  },

  signupUser: function(sock, req, reply) {
    const server = this;
    if(!req || !req.args || !req.args.uid) return reply(400, 'invalid request, uid required');

    const uid = req.args.uid;
    const uidkey = 'user:#' + uid;
    this.db.hgetall(uidkey, function(err, ret){
      if(err) return reply(500, 'db error');
      if(ret) return reply(409, 'user id ' + uid + ' already exits');
      server.createNewUser(sock, req, reply);
    });
  },

  createNewUser: function(sock, req, reply) {
    const server = this;
    const args = req.args;

    let userRecord = {
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
    const newUserConf = server.conf.new_user;
    if(newUserConf) {
      for(var i in newUserConf) {
        userRecord[i] = newUserConf[i];
      }
    }

    const uid = req.args.uid;
    const uidkey = 'user:#' + uid;
    this.db.multi().incr('user:count').hmset(uidkey, userRecord).exec(function(){
      if(err) return reply(500, 'db error');
      return reply(0, { uid:uid, passwd: args.passwd });
    });
  },

  logoutUser: function(user) {
    if(!user) return;

    user.onLogout();
    user.push('bye', 'logout');
    user.removeLink();

    const uid = user.uid;
    const uidkey = 'user:#' + uid;
    this.db.multi().hset(uidkey, 'online', 0).zrem('user:online', uid).exec();

    this.sub.unsubscribe('user:#' + uid);
    delete this.users[uid];
    this.usersCount --;
    this.pub.publish('user:log', 'user (' + uid + ') logout');
  },
});
