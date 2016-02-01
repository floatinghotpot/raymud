'use strict';

const Class = require('mixin-pro').createClass;
import { OBJ } from './obj.js';

const bodyDescMale = [
  ['瘦小', '瘦弱', '瘦长'],
  ['矮小', '中等', '高大'],
  ['又矮又胖', '肥胖', '魁梧'],
];

const bodyDescMale = [
  ['娇小', '苗条', '又高又瘦'],
  ['矮小', '中等', '高挑'],
  ['矮胖', '丰腴', '魁梧'],
];

export const CHAR = Class(OBJ, {
  constructor: function CHAR() {
    // wears/armed part: head, neck, chest, leg, foot, left hand, right hand
    this._wears = {};
  },

  looks: function(player) {
    return {
      type: this.constructor.name,
      short: this.short(),
      long: this.long() + this.facialLooks(),
      wears: this.wearLooks(),
    }
  },
  facialLooks: function(){
    // TODO: text describe according to gender / age / height / weight / face / temperament
    if(this.query('race') !== 'human') return '';
    const male = this.query('gender') === 'male';
    let str = (this === player) ? '你' : (male?'他':'她');

    const stdHeight = male ? 170 : 160; // cm
    const stdWeight = male ? 65 : 50;   // kg
    const deltaHeight = ((this.query('height') || stdHeight) - stdHeight);

  },

  wearLooks: function(){
    const wears = {};
    for(const key in this._wears) {
      wears[key] = this._wears[key].short();
    }
  },

  linkUser: function(uid) {
    this._uid = uid;
    this.set('is_player', 1);
  },

  // scene, look (char/item), vision / tell, feedback, chat/emote, combat
  notify: function(event, args) {
    if(!this._uid) return;
    const pub = this._world.pub;
    pub.publish('user:#' + this._uid, JSON.stringify({
      f: 'notify',
      uid: this._uid,
      e: event,
      args: args,
    }));
  },

  scene: function() {
    const env = this.environment();
    if(env) this.notify('scene', env.looksInside());
  },

  look: function(ob) {
    if(!ob) {
      this.scene();
    } else if(ob.instanceOf(CHAR)) {
      this.notify('look', ob.looks());
      if(this !== ob && ob.query('is_player')) ob.tell('vision', '$N正盯着你看，不知道打些什么主意。\n', this, ob);
    } else {
      this.notify('look', ob.looks());
    }
  },

  vision: function(channel, msg, who, whom) {
    const neighbors = this.environment().inventory();
    for(const key in neighbors) {
      const obj = neighbors[key];
      if(obj && obj.query('is_player')) {
        obj.tell(channel, msg, who, whom);
      }
    }
  },

  tell: function(channel, str, who, whom) {
    if(whom) str = str.replace('$n', (this === whom) ? '你' : (whom ? whom.short() : ''));
    if(who) str = str.replace('$N', (this === who) ? '你' : (who ? who.short() : ''));
    this.notify(channel, str);
  },

  feedback: function(str) {
    this.notify('feedback', str);
  },

  chat: function(str) {
    const neighbors = this.environment().inventory();
    for(const key in neighbors) {
      const obj = neighbors[key];
      if(obj && obj.query('is_player')) {
        obj.notify('chat', {
          key: this._key,
          short: this.short(),
          msg: msg,
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
    if(!this._uid) return reply(500, 'no uid is found when save');

    // TODO:
  },

  load: function(uid, reply) {
    if(!this._uid) return reply(500, 'no uid is found when save');

    // TODO:
  },

  onChar_cmd: function(req, reply) {
    // TODO:
  },

});
