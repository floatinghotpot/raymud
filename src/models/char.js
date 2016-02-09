'use strict';

var Class = require('mixin-pro').createClass;
var OBJ = require('./obj.js');

var bodyDescMale = [
  ['瘦小', '瘦弱', '瘦长'],
  ['矮小', '中等', '高大'],
  ['又矮又胖', '肥胖', '魁梧'],
];

var bodyDescFemale = [
  ['娇小', '苗条', '又高又瘦'],
  ['矮小', '中等', '高挑'],
  ['矮胖', '丰腴', '魁梧'],
];

// define number of person attributes
var NUM_ATTRIBUTES = 8;

// min / max value of attributes
var ATTRVAL_MIN = 1;
var ATTRVAL_MAX = 50;

var CHAR = Class(OBJ, {
  constructor: function CHAR() {
    // wears/armed part: head, neck, chest, leg, foot, left hand, right hand
    this._wears = {};
    this._attr = {};
  },

  initAttr: function(base) {
    // if attribute configured, use its value for attribute
    var attr = this._attr = this.query('attribute') || {};
    this.unset('attribute');

    // fill the value with preset values
    if(base && typeof base === 'object') {
      for(var i in base)
        if(i in attr) attr[i] = base[i];
    }
  },

  queryAllAttr: function() {
    return this._attr;
  },

  queryAttr: function(what, raw) {
    var attr = this._attr;
    if(attr) {
      var a = attr[what];
      if(a) {
        if(raw) return a;
        var tmp = this.queryDeep('temp/apply');
        return a + (typeof tmp === 'object') ? tmp[what] : '';
      }
    }
    return 0;
  },

  setAttr: function(what, value) {
    var attr = this._attr;
    if(attr) {
      if(attr[what] && (value>=ATTRVAL_MIN) && (value<=ATTRVAL_MAX)) {
        attr[what] = value;
      }
    }
    return 0;
  },

  looks: function(player) {
    return {
      type: this.constructor.name,
      short: this.short(),
      long: this.long() + this.facialLooks(player),
      wears: this.wearLooks(),
    };
  },

  facialLooks: function(player){
    // TODO: text describe according to gender / age / height / weight / face / temperament
    if(this.query('race') !== 'human') return '';

    var str = '你';
    var male = (this.query('gender') === 'male');
    if(this !== player) str = (male?'他':'她');

    var stdHeight = male ? 170 : 160; // cm
    var stdWeight = male ? 65 : 50;   // kg
    var deltaHeight = ((this.query('height') || stdHeight) - stdHeight);

    str += male ? bodyDescMale[4] : bodyDescFemale[4];
  },

  wearLooks: function(){
    var wears = {};
    for(var key in this._wears) {
      wears[key] = this._wears[key].short();
    }
  },

  linkUser: function(uid) {
    this._uid = uid;
    this.set('is_player', 1);
  },

  // scene, look (char/item), vision / tell, feedback, chat/emote, combat
  notify: function(event, args) {
    // console.log(event, args);
    if(!this._uid) return;
    var pub = this._world.pub;
    var req = {
      f: 'notify',
      uid: this._uid,
      e: event,
      args: args,
    };
    pub.publish('user:#' + this._uid, JSON.stringify(req));
  },

  scene: function() {
    var env = this.environment();
    if(env) {
      this.notify('scene', env.looksInside(this));
    }
    this._target = env;
  },

  move: function(dest) {
    switch(typeof dest) {
    case 'object':
      break;
    case 'string':
      if(dest[0] !== '/') dest = this.environment().absKey(dest);
      dest = this._world.loadObject(dest);
      break;
    default:
      this.notifyFail('move: invalid destination, expected: object or string, got: ' + dest);
    }

    this.putInto(dest);
    this.scene();

    return 1;
  },

  look: function(ob) {
    if(!ob) {
      this.scene();
    } else {
      if(typeof ob === 'string') {
        ob = this._world.loadObject(this.environment().absKey(ob));
        if(!ob) {
          this.notify('feedback', '这里没有这样东西。\n');
          return;
        }
      }
      this._target = ob;
      if(ob.instanceOf(CHAR)) {
        this.notify('look', ob.looks());
        if(this !== ob && ob.query('is_player')) ob.tell('vision', '$N正盯着你看，不知道打些什么主意。\n', this, ob);
      } else {
        this.notify('look', ob.looks());
      }
    }
  },

  vision: function(msg, who, whom) {
    var neighbors = this.environment().inventory();
    for(var key in neighbors) {
      var obj = neighbors[key];
      if(obj && obj.query('is_player')) {
        obj.tell('vision', msg, who, whom);
      }
    }
  },

  tell: function(channel, str, who, whom) {
    var word;
    if(who) {
      if(this === who) word = '你';
      else word = (who ? who.short() : '');
      str = str.replace('$N', word);
    }
    if(whom) {
      if(this === whom) word = '你';
      else word = (whom ? whom.short() : '');
      str = str.replace('$n', word);
    }
    this.notify(channel, str);
  },

  write: function(str) {
    this.notify('feedback', str);
  },

  notifyFail: function(str) {
    this.notify('fail', str);
  },

  chat: function(str) {
    var neighbors = this.environment().inventory();
    for(var key in neighbors) {
      var obj = neighbors[key];
      if(obj && obj.query('is_player')) {
        obj.notify('chat', {
          key: this._key,
          short: this.short(),
          str: str,
        });
      }
    }
  },

  emote: function(str, whom) {
    this.vision('emote', str, this, whom);
  },

  combat: function(str, whom) {
    this.vision('combat', str, this, whom);
  },

  save: function(reply) {
    if(!reply) reply = function(){};
    if(!this._uid) return reply(500, 'no uid is found when save');

    // TODO:
    return reply(0, 0);
  },

  load: function(uid, reply) {
    if(!reply) reply = function(){};
    if(!this._uid) return reply(500, 'no uid is found when save');

    // TODO:
    return reply(0, 0);
  },

  go: function(dir, reply) {
    var env = this.environment();
    if(env) {
      var room = env.nextRoom(dir);
      if(room) {
        reply(0, '你来到'+room.short()+'。');
        this.move(room);
        return;
      }
    }
    return reply(404, '这个方向没有出口。');
  },

  dummyReply: function(err, ret) {},

  command: function(str, reply) {
    if(!reply) reply = this.dummyReply;

    var words = str.split(' ');
    var cmd = words.shift();
    var params = words.join(' ');

    switch(cmd) {
      case 'look':
        this.look(params, reply);
        break;
      case 'go':
        this.go(params, reply);
        break;
      default:
        var target = this._target;
        if(!target) target = this.environment();
        if(target && typeof target._actions === 'object') {
          var func = target._actions[cmd];
          if(typeof func === 'function') {
            func.call(target, this, params);
          }
        }
    }
  },

  onCharCmd: function(req, reply) {
    // TODO:
    this.command(req.args, reply);
  },

});

CHAR.NUM_ATTRIBUTES = NUM_ATTRIBUTES;
CHAR.ATTRVAL_MIN = ATTRVAL_MIN;
CHAR.ATTRVAL_MAX = ATTRVAL_MAX;

exports = module.exports = CHAR;
