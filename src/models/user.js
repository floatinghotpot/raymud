'use strict';

var Class = require('mixin-pro').createClass;

var User = Class({
  constructor: function User(uid){
    this.uid = uid;
    this.reset();
  },

  reset: function(){
    this.server = null;
    this.socket = null;
    this.pin = '';
    this.profile = {};
  },

  setLink: function(server, sock, pin) {
    if(this.socket) this.removeLink();

    if(sock.users) {
      sock.users = {};
      sock.usersCount = 0;
    }

    this.server = server;
    this.socket = sock;
    this.pin = pin;

    sock.users[ this.uid ] = this;
    sock.usersCount ++;

    return this;
  },

  removeLink: function() {
    var sock = this.socket;
    if(sock) {
      delete sock.users[ this.uid ];
      sock.usersCount --;
    }
    this.reset();
    return this;
  },

  setProfile: function(p) {
    if((p.uid === this.uid) && (typeof p === 'object')) {
      for(var i in p) this.profile[i] = p[i];
    }
    return this;
  },

  getProfile: function() {
    return this.profile;
  },

  getName: function() {
    return {
      uid: this.uid,
      name: this.profile.name,
    };
  },

  saveData: function(reply) {
    if(!reply) reply = function(){};
    if(!this.server || !this.server.db) return;
    var db = this.server.db;

    var p = this.profile;
    var uidkey = 'user:#' + this.uid;
    var mul = db.multi();
    for(var i in p) mul.hset(uidkey, i, p[i]);
    mul.exec(function(err, ret){
      if(err) return reply(500, 'db error');
      return reply(0, ret);
    });
  },

  loadData: function(reply) {
    if(!reply) reply = function(){};
    if(!this.server || !this.server.db) return;
    var db = this.server.db;
    var user = this;

    var uidkey = 'user:#' + this.uid;
    db.hgetall(uidkey, function(err, userinfo) {
      if(err) return reply(500, 'db error');
      if(userinfo) {
        user.setProfile(userinfo);
        return reply(0, {});
      } else {
        reply(404, 'not found');
      }
    });
  },

  onLogin: function() {
    var pub = this.server.pub;
    if(!pub) return;
    pub.publish('user:log', 'user ' + this.uid + ' login');
    pub.publish('user:#' + this.uid, JSON.stringify({
      f: 'login',
      uid: this.uid,
      args: this.pin,
    }));

    var sub = this.server.sub;
    sub.subscribe('user:#' + this.uid);
  },

  onDrop: function() {
    var pub = this.server.pub;
    if(!pub) return;
    if(!this.world) return;
    var worldkey = 'world:#' + this.world;
    pub.publish(worldkey, JSON.stringify({
      f: 'drop',
      uid: this.uid,
      seq: 0,
      args: 0,
    }));
  },

  onReconnect: function(req) {
    var pub = this.server.pub;
    if(!pub) return;

    this.server.removeDropped(this.uid);

    var str = 'user (' + this.uid + ') reconnect';
    console.log(str);
    pub.publish('user:log', str);

    pub.publish('user:#' + this.uid, JSON.stringify({
      f: 'reconnect',
      seq: req.seq,
      args: this.pin,
    }));

    if(this.world) {
      var worldkey = 'world:#' + this.world;
      pub.publish(worldkey, JSON.stringify({
        f: 'reconnect',
        uid: this.uid,
        seq: 0,
        args: 0,
      }));
    }

    //var sub = this.server.sub;
    //sub.subscribe('user:#' + this.uid);
  },

  onLogout: function() {
    var sub = this.server.sub;
    var pub = this.server.pub;

    sub.unsubscribe('user:#' + this.uid);

    var str = 'user (' + this.uid + ') logout';
    console.log(str);
    pub.publish('user:log', str);

    if(this.world) {
      var worldkey = 'world:#' + this.world;
      pub.publish(worldkey, JSON.stringify({
        f: 'exit',
        uid: this.uid,
        seq: 0,
        args: 0,
      }));
    }
  },

  notify: function(event, args) {
    var sock = this.socket;
    if(sock) sock.emit('notify', { uid: this.uid, e: event, args: args });
    return this;
  },

  onMessage: function(msg) {
    // console.log('user.onMessage', msg);
    var req = null;
    try {
      req = JSON.parse(msg);
    } catch (e) {
      return;
    }
    if(!req || typeof req !== 'object') return;

    var sock = this.socket;
    if(!sock) return;
    switch(req.f) {
    case 'reply': // reply to remote call
    case 'notify': // notify
      var f = req.f;
      delete req.f;
      sock.emit(f, req);
      break;
    case 'login':
    case 'reconnect':
      if(req.uid === this.uid && req.args !== this.pin) {
        this.notify('bye', 'replaced by another login');
      }
      break;
    case 'logout':
      break;
    case 'drop':
      break;
    case 'reload':
      var pub = this.server.pub;
      var user = this;
      this.loadData(function(err, ret){
        if(!err) {
          pub.publish('user:log', 'user (' + user.uid + ') data reloaded');
          if(user.world) {
            var worldkey = 'world:#' + user.world;
            pub.publish(worldkey, JSON.stringify({
              f: 'reload',
              uid: user.uid,
              seq: 0,
              args: 0,
            }));
          } else {
            user.notify('reload', {
              uid: user.uid,
              profile: user.getProfile(),
            });
          }
        } else {
          pub.publish('user:log', 'Error: user (' + user.uid + ') data reload failed, due to ' + ret);
        }
      });
      break;
    default:
      // console.log('unknown message f: ' + req.f);
    }
  },

  onUserRpcworlds: function(req, reply) {
    var db = this.server.db;
    if(!db) return reply(500, 'db error');

    var worldskey = 'world:list';
    db.zrange(worldskey, 0, -1, function(err, ret){
      if(err) return reply(500, 'db error');
      if(!ret) return reply(404, 'not found');
      console.log(ret);
      var m = db.multi();
      for(var i=0, len=ret.length; i<len; i++) m.hgetall('world:#' + ret[i]);
      m.exec(function(err, list){
        return reply(0, list);
      });
    });
  },

  onUserRpcenter: function(req, reply) {
    // if(this.world) return reply(400, 'already in a world');
    var db = this.server.db;
    var pub = this.server.pub;
    if(!db || !pub) return reply(500, 'db error');

    var worldId = req.args;
    if(!worldId) return reply(400, 'please specify id of world to enter');

    var worldkey = 'world:#' + worldId;
    var user = this;
    db.hgetall(worldkey, function(err, worldinfo) {
      if(err) return reply(500, 'db error');
      if(!worldinfo) return reply(404, 'not found');
      reply(0, 'ok');

      user.world = worldId;
      pub.publish(worldkey, JSON.stringify({
        f: 'enter',
        uid: user.uid,
        seq: req.seq,
        args: worldId,
      }));
    });
  },

  onUserRpcexit: function(req, reply) {
    if(!this.world) return reply(400, 'not in a world');
    var worldkey = 'world:#' + this.world;
    var pub = this.server.pub;
    if(pub) pub.publish(worldkey, JSON.stringify({
      f: 'exit',
      uid: this.uid,
      seq: req.seq,
      args: 0,
    }));
    this.world = null;
    this.socket.leave(worldkey + '#cast');
    return reply(0, {});
  },
});

exports = module.exports = User;
