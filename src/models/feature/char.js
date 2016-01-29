'use strict';

const Class = require('mixin-pro').createClass;

import { Lang } from '../lang.js';
import { SYSTEM, USER } from '../system.js';
import { F_DBASE, F_NAME } from './base.js';

export const F_STUDY = Class({
  constructor: function F_STUDY() {
  },
  
  studyOb: function(me) {
    const thisPlayer = User.current();
    if(thisPlayer.isBusy())
      return thisPlayer.notifyFail('你正忙着其他事呢！\n');
    if(thisPlayer.isFighting())
      return thisPlayer.notifyFail('你还是先应付眼前的敌人吧！\n');

    const required = this.query('required');
    if(required) {
      let req = required['attribute'];
      if(typeof req === 'object') {
        for(const t in req) {
          const min = req[t];
          if(thisPlayer.queryAttr(t, 1) < min) {
            thisPlayer.write('你的' + Lang.toChinese(t) + '不够，所以这上面记载的内容完全无法体会。\n');
            return 1;
          }
        }
      }
      let req = required['skill'];
      if(typeof req === req) {
        for(const t in req) {
          const min = req[t];
          if(thisPlayer.querySkill(t, 1) < min) {
            thisPlayer.write('你在' + Lang.toChinese(t) + '上的造诣还不够理解这上面记载的内容。\n');
            return 1;
          }
        }
      }
      
      const content = this.query('content');
      if(!content) {
        return thisPlayer.notifyFail('这上面没有记载什么有用的内容。\n');
      }
      let toLearn = 0;
      for(const t in content) {
        if(thisPlayer.querySkill(t, 1) < max) toLearn ++;
      }
      if(! toLearn) {
        thisPlayer.write('这上面记载的内容对你而言都了无新意。\n');
        return 1;
      }

      thisPlayer.startBusy(this.studyContent, this.haltStudy);
      
      const msg = this.query('study_msg');
      if(!msg) msg = '$N开始聚精会神地研读' + this.name() + '上面的内容。\n';
      SYSTEM.messageVision(msg, thisPlayer);
      return 1;
    }
  },
  
  studyContent: function(me) {
    const content = this.query('content');
    if(!content) return 0;
    
    let contentSize = 0;
    for(const i in content) {
      contentSize ++;
    }
    if(!contentSize) return 0;
    
    // 使用读书识字的技能
    let skill = me.querySkill('literate');
    
    // 耗费精神 1-10 点
    let cost = 1 + (9 - me.queryAttr('wis')/3);
    if(cost < 1) cost = 1;
    
    if(me.queryStat('sen') < cost
       || me.queryStat('gin') < cost
       || me.queryStat('fatigue') >= me.queryStatMax('fatigue')) {
      SYSTEM.tellObject(me, '你觉得精神不济，无法再继续研读了。\n');
      return 0;
    }
    
    me.consumeStat('gin', cost);
    me.consumeStat('sen', cost);
    
    let gain = 0;
    const point = me.queryAttr('int') / contentSize;
    for(const t in content) {
      const max = content[t];
      if(max < skill) max = skill;
      if(me.querySkill(t, 1) < content[i]
         && Math.random()*(point+skill) >= max/2) {
        me.improveSkill(t, 1 + Math.round(Math.random() * point));
        gain ++;
      }
    }
    
    if(gain) {
      me.improveSkill('literate', 1 + Math.round(Math.random() * me.queryAttr('int')));
      me.supplementStat('fatigue', gain);
      me.damageStat('sen', gain);
    }
    
    return 1;
  },
  
  haltStudy: function(me, from, how) {
    msg = this.query('halt_msg');
    if(!msg) msg = '你停止研读' + this.name() + '上面记载的内容。\n');
    USER.current().write(msg);
    return 1;
  },
  
});

let regenerating = 1;
let st_regenerator = {};
let lastFromOb = null;
let f_exhausted = {};
let f_destroyed = {};
let f_notified = {};

export const F_STATISTIC = Class({
  constructor: function F_STATISTIC() {
    this._stMax = {};
    this._stEffective = {};
    this._stCurrent = {};
    this._stNotify = {};
  },
  
  queryStatName: function() { return Object.keys(_this._st_max) || []; },
  lastDamageGiver: function() { return lastFromOb; },
  queryExhausted: function() { return f_exhausted; },
  queryDestroyed: function() { return f_destroyed; },
  queryNotified: function() { return f_notified; },
  
  clearStatFlags: function() {
    f_exhausted = {};
    f_destroyed = {};
    f_notified = {};
  },
  
  queryStat: function( what ) {
    let val = this._stCurrent && this._stCurrent[what];
    if(!val) val = this._stEffective && this._stEffective[what];
    if(!val) val = this._stMax && this._stMax[what];
    return val || 0;
  },
  deleteStat: function(what) {
    if(this._stCurrent) delete this._stCurrent[what];
    if(this._stEffective) delete this._stEffective[what];
    if(this._stMax) delete this._stMax[what];
    if(this._stNotify) delete this._stNotify[what];
    if(st_regenerator && typeof st_regenerator === 'object') delete st_regenerator[what];
  },
  
  // get basic data info
  queryStatCurrent: function(what) {
    return this._stCurrent[what] || 0;
  },
  queryStatEffective: function(what) {
    return this._stEffective[what] || 0;
  },
  queryStatMax: function(what) {
    return this._stMax[what] || 0;
  },
  queryStatNotify: function(what) {
    return this._stNotify[what] || 0;
  },
  queryStatRegenerate: function(what) {
    return (st_regenerator && st_regenerator[what]) || 0;
  },
  
  // set basic data
  
});
