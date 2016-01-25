'use strict';

import { SYSTEM, USER } from '../system.js';

// F_DBASE

export const F_DBASE = () => {
};

F_DBASE.prototype = {
  // default ob, is just the constructor name, so not needed

  // normal data
  set: (prop, data) => {
    if(!this._dbase) this._dbase = {};
    // XXX: prop/sub not implemented
    this._dbase[prop] = data;
    return this;
  },
  query: (prop, raw) => {
    if(!this._dbase) return 0;
    // XXX: prop/sub not implemented
    return this._dbase[prop];
  },
  unset: (prop) => {
    if(!this._dbase) return;
    // XXX: prop/sub not implemented
    delete this._dbase[prop];
    return this;
  },
  add: (prop, data) => {
    let old = 0;
    if(!this._dbase || !(old = this.query(prop, 1)))
      return this.set(prop, data);
    if(typeof old === 'function') 
      return old;
    return this.set(prop, old + data);
  },
  queryAll: () => {
    return this._dbase;
  },

  // temp data
  setTemp: (prop, data) => {
    if(!this._tmpDbase) this._tmpDbase = {};
    this._tmpDbase[prop] = data;
    return this;
  },
  queryTemp: (prop) => {
    if(!this._tmpDbase) return 0;
    return this._tmpDbase[prop];
  },
  removeTemp: (prop) => {
    if(!this._tmpDbase) return;
    delete this._tmpDbase[prop];
    return this;
  },
  addTemp: (prop, data) => {
    let old = 0;
    if(!this._tmpDbase || !(old = this.queryTemp(prop, 1)))
      return this.setTemp(prop, data);
    if(typeof old === 'function') 
      return old;
    return this.setTemp(prop, old + data);
  },
  queryAllTemp: () => {
    return this._tmpDbase;
  },
  clearTemp: () => {
    this._tmpDbase = {};
  },
};

// F_CLEAN_UP

export const F_CLEAN_UP = () => {};

F_CLEAN_UP.prototype = {
  clean_up: () => {
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

export const F_NAME = () => {};

F_NAME.prototype = {
  visible: (ob) => {
    return 1;
  },
  setName: (name, idList) => {
    this.set('name', name);
    if(idList.length === 1 && Array.isArray(idList[0])) {
      this.set('id', idList[0][0]);
      this._idList = idList[0];
    } else {
      this.set('id', idList[0]);
      this._idList = idList;
    }
  },
  queryId: () => {
    return this.query('id');
  },
  id: (str) => {
    const _idList = this._idList;
    return Array.isArray(_idList) && (_idList.indexOf(str) >= 0);
  },
  getIdList: () => {
    return this._idList;
  },
  name: (raw) => {
    const str = this.query('name');
    return str ? str : this.constructor.name;
  },
  short: (raw) => {
    let str = this.query('short', 1);
    if(!str) str = this.name(1);
    // XXX: option/BRIEF_SHORT not implemented
    return str;
  },
  long: (raw) => {
    const str = this.query('long');
    if(str) return str;
    return `${this.name(raw)}看起来没有什么特别。\n`; 
  },
  rank: (politeness, raw) => {
    return this.name(raw);
  },
};

// F_MOVE

export const F_MOVE = () => {
  this._weight = 0;
  this._encumb = 0;
  this._maxEncumb = 0;
  this._maxInventory = -1;
};

F_MOVE.prototype = {
  weight: () => {
    return this._weight + this._encumb;
  },
  queryWeight: () => {
    return this._weight;
  },
  queryEncumb: () => {
    return this._encumb;
  },
  queryMaxEncumb: () => {
    return this._maxEncumb;
  },
  queryMaxInventory: () => {
    return this._maxInventory;
  },
  setMaxEncumb: (e) => {
    this._maxEncumb = e;
  },
  setMaxInventory: (i) => {
    this._maxInventory = i;
  },

  addEncumb: (w) => {
    this.encumb += w;
    if(encumb < 0) USER.current().error('move: encumbrance underflow.\n');
    else {
      const env = this.env && this.env();
      if(env) env.addEncumb(w);
    }
  },
  setWeight: (w) => {
    const env = this.env && this.env();
    if(env) {
      if(w != this._weight) env.addEncumb(w - this._weight);
    }
    this._weight = w;
  },
  receiveObject: (ob, fromInventory) => {
    if(!fromInventory && (this._encumb + ob.weight() > this._maxEncumb)) {
      return USER.current().notifyFail(`${ob.name()}太重了。\n`);
    }
  },
  move: (dest, silently) => {
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

