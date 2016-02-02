'use strict';

(function(){

var redis = require('redis');
var Class = require('mixin-pro').createClass;
var ROOM = require('./models/room.js');
var CHAR = require('./models/char.js');

var WorldServer = Class({
  constructor: function WorldServer(conf) {
    this.conf = conf;
    this.reset();
  },

  reset: function() {
    this.db = null;
    this.pub = null;
    this.sub = null;
    this.id = 0;
    this.timer = 0;
    this.isRunning = false;

    this.protos = {};
    this.objects = {};
    this.rooms = {};
    this.players = {};

    this.counts = {
      protos: 0,
      objects: 0,
      rooms: 0,
      players: 0,
    };
  },

  startup: function() {
    if(this.isRunning) throw new Error('server is already running.');

    var redis_conf = this.conf.redis;

    // use redis as data storage
    this.db = redis.createClient(redis_conf.port, redis_conf.host, {});
    this.db.on('error', function(err) {
      throw new Error('db redis eror: ' + err);
    });

    // use redis pub/sub feature as message hub
    this.pub = redis.createClient(redis_conf.port, redis_conf.host, {});
    this.pub.on('error', function(err) {
      throw new Error('pub redis eror: ' + err);
    });
    this.sub = redis.createClient(redis_conf.port, redis_conf.host, {});
    this.sub.on('error', function(err) {
      throw new Error('pub redis eror: ' + err);
    });

    var self = this;
    this.db.incr('world:seq', function(err, instanceId){
      if(err) return;
      self.startInstance(instanceId);
    });
  },

  startInstance: function() {
    this.id = instanceId;

    var self = this;
    var conf = this.conf;
    var db = this.db;
    var now = Date.now();

    this.setup();

    // init userver instance info & expire in 5 seconds,
    // we have to update it every 5 seconds, as heartbeat info
    var key = 'world:#' + instanceId;
    db.multi().mset(key, {
      id: instanceId,
      started: now,
      users: 0,
    }).expire(key, 5).zadd('world:all', now, instanceId).exec();

    // init tick() timer
    self.timer = setInterval(function(){
      self.tick();
    }, 1000);

    // init listener for message hub
    var sub = this.sub;
    sub.on('subscribe', function(channel, count){});
    sub.on('message', function(channel, message){
      var words = channel.split('#');
      switch(words[0]) {
        case 'world':
          self.onMessage(message);
          break;
        case 'player':
          var uid = words[1];
          if(uid) {
            var player = self.players[uid];
            if(player) player.onMessage(message);
          }
          break;
      }
    });
    sub.subscribe('world:#' + instanceId);

    _instances[instanceId] = this;
    this.isRunning = true;
    this.pub.publish('world:log', 'world #' + instanceId + ' started');
  },

  setup: function() {
    this.loadProto('/player', CHAR);

    this.loadRoom('/void', {
      short: '无名之地',
      long: '你身处一片茫茫的迷雾中，什么都看不见。',
    });

    var files = this.conf.world;
    if(!Array.isArray(files)) throw new Error('setup: world files not configured');
    for(var i=0; i<files.length; i++) {
      require(files[i]).setup(this);
    }
  },

  loadProto: function(protoKey, proto) {
    if(typeof proto !== 'function') throw new Error('addProto: proto should be function/class');
    proto._key = protoKey;
    this.protos[protoKey] = proto;
    this.counts.protos ++;
  },

  loadRoom: function(roomKey, roomProto) {
    var obj = null;
    switch(typeof roomProto) {
      case 'function':
        obj = new roomProto(this);
        if(!obj.instantOf(ROOM)) throw new Error('invalid room proto: ' + roomProto);
        break;
      case 'object':
        obj = new ROOM(this);
        obj.setData(roomProto);
        break;
      case 'string':
        obj = new ROOM(this);
        obj.set('name', roomProto);
        obj.set('short', roomProto);
        break;
      default:
        throw new Error('invalid room proto: ' + roomProto);
        break;
    }

    obj._key = roomKey;
    this.rooms[roomKey] = obj;
    this.counts.rooms ++;

    this.objects[roomKey] = obj;
    this.counts.objects ++;
  },

  loadObject: function(protoKey) {
    var obj = this.objects[protoKey];
    if(!obj) {
      var proto = this.protos[protoKey];
      if(!proto) throw new Error('proto not found: ' + protoKey);
      if(!proto._copyId) proto._copyId = 0;
      if(!proto._copyCnt) proto._copyCnt = 0;

      obj = new proto(this);
      var key = obj._key = protoKey;
      this.objects[key] = obj;
      this.counts.objects ++;
      obj.onCreate();
    }
    return obj;
  },

  cloneObject: function(protoKey) {
    var proto = this.protos[protoKey];
    if(!proto) throw new Error('proto not found: ' + protoKey);
    if(!proto._copyId) proto._copyId = 0;
    if(!proto._copyCnt) proto._copyCnt = 0;

    var obj = new proto(this);
    proto._copyId ++;
    proto._copyCnt ++;
    var key = obj._key = protoKey + '#' + proto._copyId;
    this.objects[key] = obj;
    this.counts.objects ++;
    obj.onCreate();

    return obj;
  },

  destroyObject: function(obj) {
    obj.onDestroy();

    var key = obj._key;
    if(key) {
      delete this.objects[key];
      this.counts.objects --;

      var protoKey = key.split('#')[0];
      if(protoKey) {
        var proto = this.protos[protoKey];
        if(proto) {
          proto._copyCnt --;
        }
      }
    }
  },

  unloadAll: function() {
    // unload players
    var players = this.players;
    for(var i in players) {
      var player = players[i];
      player.save();
      player.destruct();
      delete players[i];
    }
    this.players = {};
    this.counts.players = 0;

    // unload rooms
    var rooms = this.rooms;
    for(var i in rooms) {
      var room = rooms[i];
      room.destruct();
      delete rooms[i];
    }
    this.rooms = {};
    this.counts.rooms = 0;

    // unload objects
    var objects = this.objects;
    for(var i in objects) {
      var obj = objects[i];
      obj.destruct();
    }
    this.objects = {};
    this.counts.objects = 0;

    // unload protos
    var protos = this.protos;
    for(var i in protos) {
      delete protos[i];
    }
    this.protos = {};
    this.counts.protos = 0;
  },

  shutdown: function() {
    if(!this.isRunning) return;

    // clear tick() timer
    if(this.timer) clearInterval(this.timer);

    // clear server entry in db
    var db = this.db;
    db.multi().del('world:#' + this.id).zrem('world:all', this.id).exec(function(err, ret){
      db.quit();
    });

    // unload all objects, rooms, and protos
    this.unloadAll();

    this.pub.publish('world:log', 'world #' + this.id + ' closed');

    this.sub.unsubscribe();
    this.sub.end();
    this.pub.end();
    this.db.end();

    delete _instances[this.id];
    this.reset();
  },

  tick: function() {
    var self = this;
    var players = this.players;
    var dropped = this.dropped;

    if(this.db && this.id) {
      var key = 'world:#' + this.id;
      this.db.multi()
        .hset(key, 'players', self.playersCount).expire(key, 5)
        .zremrangebyscore('world:all', 0, Date.now()-5000)
        .zadd('world:all', now, this.id)
        .exec();
    }
  },

  onMessage: function(msg) {
    console.log('world onMessage: ' + msg);
    var req = null;
    try {
      req = JSON.parse(msg);
    } catch(e) {
      console.log(msg);
      return;
    }
    if(!req || typeof req !== 'object') return;

    var pub = this.pub;
    var userkey = 'user:#' + req.uid;
    var reply = function(err, ret) {
      pub.publish(userkey, JSON.stringify({
        f: 'reply',
        seq: req.seq,
        err: err,
        ret: ret,
      }));
    };

    switch(req.f) {
      case 'enter':
      case 'exit':
      case 'drop':
      case 'reconnect':
      case 'reload':
        var func = this['onCharCmd' + req.f];
        if(typeof func === 'function') func(req, reply);
        break;
      case 'cmd':
        var player = this.players[req.uid];
        if(player) {
          player.onCharCmd(req, reply);
        } else {
          reply(404, 'player not found in world: ' + req.uid);
        }
        break;
      default:
        reply(400, 'unknown message: ' + req.f);
    }
  },

  onCharCmdenter: function(req, reply) {
    var uid = req.uid;
    if(!uid) return;
    if(this.players[uid]) return;
    var player = this.cloneObject('/player');
    if(player) {
      // link player character with user with same uid
      player.linkUser(uid);

      player.load(function(err, ret) {
        if(err) return reply(500, 'fail load player data');

        var conf = this.conf;
        if(ret === 0) { // new player
          player.setData(conf.new_char);
          player.save();
        }

        var startRoom = player.query('last_room') || conf.entries[ Math.floor(Math.random() * conf.entries.length) ];
        player.move(startRoom);

        reply(0, {});
      });
    }
  },

  onCharCmdexit: function(req, reply) {
    var player = this.players[req.uid];
    if(!player) return reply(404, 'player not found: ' + req.uid);

    player.save();
    player.destruct();
    delete this.players[req.uid];

    reply(0, {});
  },

  onCharCmddrop: function(req, reply) {
    var player = this.players[req.uid];
    if(!player) return reply(404, 'player not found: ' + req.uid);

    player.set('offline', 1);
    player.vision('$N掉线了。\n', player);
  },

  onCharCmdreconnect: function(req, reply) {
    var player = this.players[req.uid];
    if(!player) return reply(404, 'player not found: ' + req.uid);

    player.unset('offline', 1);
    player.vision('$N重新连线了。\n', player);
  },

  onCharXreload: function(req, reply) {
  },

});

exports = module.exports = WorldServer;

})();
