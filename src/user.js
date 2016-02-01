'use strict';

const Class = require('mixin-pro').createClass;

export const User = Class({
  constructor: function User(uid){
    this.server = null;
    this.socket = null;
    this.uid = uid;
    this.pin = '';
    this.profile = {};
  },

  setLink: function(server, sock, pin) {
    if(user.socket) user.removeLink();
    this.server = server;
    this.socket = sock;
    this.pin = pin;

    sock.users[ uid ] = this;
    sock.usersCount ++;

    return this;
  },

  removeLink: function() {
    const sock = this.socket;
    if(sock) {
      delete sock.users[ this.uid ];
      sock.usersCount --;
    }
    this.socket = null;
    this.server = null;
    this.pin = '';
    return this;
  },

  setProfile: function(p) {
    if(p.uid !== this.uid) return;
    if(typeof p !== 'object') return;
    for(var i in p) this.profile[i] = p[i];
    return this;
  },

  getProfile: function(p) {
    return this.profile;
  },

  getName: function() {
    return {
      uid: this.uid,
      name: this.profile.name,
    };
  },

  saveData: function(reply) {
    if(!reply) reply = function(err, ret){};

    if(!this.server) return;
    if(!this.server.db) return;
    const db = this.server.db;
    if(!db) return;

    const p = this.profile;
    const uidkey = 'user:#' + this.uid;
    const mul = db.multi();
    for(const i in p) mul.hset(uidkey, i, p[i]);
    mul.exec(function(err, ret){
      if(err) return reply(500, 'db error');
      return reply(0, {});
    });
  },

  loadData: function(reply) {
    if(!reply) reply = function(err, ret){};

    if(!this.server) return;
    if(!this.server.db) return;
    const db = this.server.db;
    if(!db) return;

    const uidkey = 'user:#' + this.uid;
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
    const pub = this.server.pub;
    if(!pub) return;
    pub.publish('user:log', 'user ' + this.uid + ' login');
    pub.publish('user:#' + this.uid, JSON.stringify({
      f: 'login',
      uid: this.uid,
      args: this.pin,
    }));
  },

  onDrop: function() {
    const pub = this.server.pub;
    if(!pub) return;
    if(!this.world) return;
    const worldkey = 'world:#' + this.world;
    pub.publish(worldkey, JSON.stringify({
      f: 'drop',
      uid: this.uid,
      seq: 0,
      args: 0,
    }));
  },

  onReconnect: function(req) {
    const pub = this.server.pub;
    if(!pub) return;

    pub.publish('user:log', 'user (' + this.uid + ') reconnect');
    pub.publish('user:#' + this.uid, JSON.stringify({
      f: 'reconnect',
      seq: req.seq,
      args: this.pin,
    }));

    if(this.world) {
      const worldkey = 'world:#' + this.world;
      this.socket.join(worldkey + '#cast');
      pub.publish(worldkey, JSON.stringify({
        f: 'reconnect',
        uid: this.uid,
        seq: 0,
        args: 0,
      }));
    }
  },

  onLogout: function() {
    if(!this.world) return;
    const worldkey = 'world:#' + this.world + '#cast';
    this.socket.leave(workdkey);

    const pub = this.server.pub;
    if(!pub) return;
    pub.publish(worldkey, JSON.stringify({
      f: 'exit',
      uid: this.uid,
      seq: 0,
      args: 0,
    }));
  },

  notify: function(event, args) {
    const sock = this.socket;
    if(sock) sock.emit('notify', { uid: this.uid, e: event, args: args });
    return this;
  },

  // message receive from message hub
  onMessage: function(msg) {
    let req = null;
    try {
      req = JSON.parse(msg);
    } catch (e) {
      console.log(e);
      return;
    }
    if(!req || typeof req !== 'object') return;

    const sock = this.socket;
    if(!sock) return;
    switch(req.f) {
      case 'reply': // reply to remote call
      case 'notify': // notify
        const f = req.f;
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
        const pub = this.server.pub;
        const user = this;
        this.reloadData(function(err, ret){
          pub.publish('user:log', 'user (' + user.uid + ') data reloaded');
          if(user.world) {
            const worldkey = 'world:#' + user.world;
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
        });
        break;
      default:
        console.log('unknown message f: ' + req.f);
    }
  },

  onUser_worlds: function(req, reply) {
    const db = this.server.db;
    if(!db) return reply(500, 'db error');

    const now = Date.now();
    const worldskey = 'world:list';
    db.zrange(worldskey, 0, -1, function(err, ret){
      if(err) return reply(500, 'db error');
      if(!ret) return reply(404, 'not found');
      const m = db.multi();
      for(let i=0, len=ret.length; i<len; i++) m.hgetall('world:#' + ret[i]);
      m.exec(function(err, list){
        return reply(0, list);
      });
    });
  },

  onUser_enter: function(req, reply) {
    if(this.world) return reply(400, 'already in a world');
    const db = this.server.db;
    const pub = this.server.pub;
    if(!db || !pub) return reply(500, 'db error');

    const worldId = req.args;
    if(!worldId) return reply(400, 'please specify id of world to enter');

    const worldkey = 'world:#' + worldId;
    const user = this;
    db.hgetall(worldkey, function(err, worldinfo) {
      if(err) return reply(500, 'db error');
      if(!worldinfo) return reply(404, 'not found');
      reply(0, worldinfo);

      user.world = worldId;
      user.socket.join(worldkey + '#cast');
      pub.publish(worldkey, JSON.stringify({
        f: 'enter',
        uid: user.uid,
        seq: req.seq,
        args: worldId,
      }));
    });
  },

  onUser_exit: function(req, reply) {
    if(!this.world) return reply(400, 'not in a world');
    const worldkey = 'world:#' + this.world;
    const pub = this.server.pub;
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
