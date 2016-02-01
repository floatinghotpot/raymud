'use strict';

const Class = require('mixin-pro').createClass;
import { OBJ } from './obj.js';

export const CHAR = Class(OBJ, {
  constructor: function CHAR() {
  },

  linkUser: function(uid) {
    this._uid = uid;
    this.set('is_player', 1);
  },

  // scene, look (char/item), vision, chat/emote, combat
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

  tell: function(channel, str, who, whom) {
    if(whom) str = str.replace('$n', (this === whom) ? '你' : (whom ? whom.short() : ''));
    if(who) str = str.replace('$N', (this === who) ? '你' : (who ? who.short() : ''));
    this.notify(channel, str);
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
