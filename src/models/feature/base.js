'use strict';

import { SYSTEM, USER } from '../system.js';

// F_DBASE

export const F_DBASE = function() {
};

F_DBASE.prototype = {
  // default ob, is just the constructor name, so not needed

  // normal data
  set: function(prop, data) {
    if(!this._dbase) this._dbase = {};
    // XXX: prop/sub not implemented
    this._dbase[prop] = data;
    return this;
  },
  query: function(prop, raw) {
    if(!this._dbase) return 0;
    // XXX: prop/sub not implemented
    return this._dbase[prop];
  },
  unset: function(prop) {
    if(!this._dbase) return;
    // XXX: prop/sub not implemented
    delete this._dbase[prop];
    return this;
  },
  add: function(prop, data) {
    let old = 0;
    if(!this._dbase || !(old = this.query(prop, 1)))
      return this.set(prop, data);
    if(typeof old === 'function') 
      return old;
    return this.set(prop, old + data);
  },
  queryAll: function() {
    return this._dbase;
  },

  // temp data
  setTemp: function(prop, data) {
    if(!this._tmpDbase) this._tmpDbase = {};
    this._tmpDbase[prop] = data;
    return this;
  },
  queryTemp: function(prop) {
    if(!this._tmpDbase) return 0;
    return this._tmpDbase[prop];
  },
  unsetTemp: function(prop) {
    if(!this._tmpDbase) return;
    delete this._tmpDbase[prop];
    return this;
  },
  addTemp: function(prop, data) {
    let old = 0;
    if(!this._tmpDbase || !(old = this.queryTemp(prop, 1)))
      return this.setTemp(prop, data);
    if(typeof old === 'function') 
      return old;
    return this.setTemp(prop, old + data);
  },
  queryAllTemp: function() {
    return this._tmpDbase;
  },
  clearTemp: function() {
    this._tmpDbase = {};
  },
};

// F_CLEAN_UP

export const F_CLEAN_UP = function() {};

F_CLEAN_UP.prototype = {
  clean_up: function() {
    if(this.interactive && this.interactive()) return 1;
    if(this.environment && this.environment()) return 1;
    const items = this.inventory && this.inventory();
    if(items && items.length) {
      for(let i=0; i<items.length; i++) {
        const item = items[i];
        if(item.interactive && item.interactive()) return 1;
      }
    }
    SYSTEM.destroy(this);
    return 0;
  },
};

// F_NAME

export const F_NAME = function() {};

F_NAME.prototype = {
  visible: function(ob) {
    return 1;
  },
  setName: function(name, idList) {
    this.set('name', name);
    if(idList.length === 1 && Array.isArray(idList[0])) {
      this.set('id', idList[0][0]);
      this._idList = idList[0];
    } else {
      this.set('id', idList[0]);
      this._idList = idList;
    }
  },
  queryId: function() {
    return this.query('id');
  },
  id: function(str) {
    const _idList = this._idList;
    return Array.isArray(_idList) && (_idList.indexOf(str) >= 0);
  },
  getIdList: function() {
    return this._idList;
  },
  name: function(raw) {
    const str = this.query('name');
    return str ? str : this.constructor.name;
  },
  short: function(raw) {
    let str = this.query('short', 1);
    if(!str) str = this.name(1);
    // XXX: option/BRIEF_SHORT not implemented
    return str;
  },
  long: function(raw) {
    const str = this.query('long');
    if(str) return str;
    return `${this.name(raw)}看起来没有什么特别。\n`; 
  },
  rank: function(politeness, raw) {
    return this.name(raw);
  },
};

// F_MOVE

export const F_MOVE = function() {
  this._weight = 0;
  this._encumb = 0;
  this._maxEncumb = 0;
  this._maxInventory = -1;
};

F_MOVE.prototype = {
  weight: function() {
    return this._weight + this._encumb;
  },
  queryWeight: function() {
    return this._weight;
  },
  queryEncumb: function() {
    return this._encumb;
  },
  queryMaxEncumb: function() {
    return this._maxEncumb;
  },
  queryMaxInventory: function() {
    return this._maxInventory;
  },
  setMaxEncumb: function(e) {
    this._maxEncumb = e;
  },
  setMaxInventory: function(i) {
    this._maxInventory = i;
  },

  addEncumb: function(w) {
    this.encumb += w;
    if(encumb < 0) USER.current().error('move: encumbrance underflow.\n');
    else {
      const env = this.env && this.env();
      if(env) env.addEncumb(w);
    }
  },
  setWeight: function(w) {
    const env = this.env && this.env();
    if(env) {
      if(w != this._weight) env.addEncumb(w - this._weight);
    }
    this._weight = w;
  },
  receiveObject: function(ob, fromInventory) {
    if(!fromInventory && (this._encumb + ob.weight() > this._maxEncumb)) {
      return USER.current().notifyFail(`${ob.name()}太重了。\n`);
    }
  },
  move: function(dest, silently) {
    if(this.query('equipped') && !this.unequip()) {
      return USER.current().notifyFail('你没有办法取下这样东西。\n');
    }
    
    switch(typeof dest) {
      case 'object':
        break;
      case 'function':
        break;
      default:
        
    }
  },
};

