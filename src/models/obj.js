'use strict';

const Class = require('mixin-pro').createClass;
const path = require('path');

export const OBJ = Class({
  constructor: function OBJ(world) {
    this._world = world;
    this._data = {};
    this._env = null;
    this._key = '';
    this._objs = {};
    this._actions = {};
  },
  destruct: function() {
    this.cleanup();
    if(this._env) this.removeFrom(this._env);
    this._world.destroyObject(this);
  },

  // overridable
  // will be called when loadObject() or cloneObject()
  onCreate: function() {},
  // will be called when in destruct()
  onDestroy: function() {},

  // ======================
  // F_DBASE
  setRawData: function(data) {
    if(typeof data !== 'object') throw new Error('setData: object required');
    this._data = data;
    return this;
  },
  setData: function(data) {
    if(typeof data !== 'object') throw new Error('setData: object required');
    for(const prop in data) {
      if(prop.indexOf('/')>=0) {
        this.setDeep(prop, data);
      } else {
        this.set(prop, data[prop]);
      }
    }
  },
  queryData: function(data) {
    return this._data;
  },

  // set('prop', data);
  set: function(prop, data) {
    this._data[prop] = data;
    return this;
  },
  unset: function(prop) {
    delete this._data[prop];
    return this;
  },
  query: function(prop, raw) {
    return this._data[prop];
  },
  add: function(prop, data) {
    const old = this.query(prop, 1);
    if(!old) return this.set(prop, data);
    if(typeof old === 'function') return old;
    return this.set(prop, old + data);
  },

  // setDeep('prop1/sub/sub2', data);
  setDeep: function(prop, data) {
    const words = prop.split('/');
    let _data = this._data;
    const n = words.length -1;
    for(let i=0; i<n; i++) {
      const d = _data[words[i]];
      if(!d) _data[words[i]] = {};
      _data = d;
    }
    _data[words[n]] = data;
    return this;
  },
  // queryDeep('prop1/sub/sub2', data);
  queryDeep: function(prop, raw) {
    const words = prop.split('/');
    let _data = this._data;
    const n = words.length -1;
    for(let i=0; i<n; i++) {
      const d = _data[words[i]];
      if(!d) return 0;
      _data = d;
    }
    return _data[words[n]];
  },

  // ======================
  // F_NAME
  setName: function(name, idlist) {
    this.set('name', name);
    if(idlist.length === 1 && Array.isArray(idlist[0])) {
      this.set('id', idlist[0][0]);
      this.set('idlist', idlist[0]);
    } else {
      this.set('id', idlist[0]);
      this.set('idlist', idlist);
    }
  },
  queryId: function() {
    return this.query('id');
  },
  getIdList: function() {
    return this.query('idlist');
  },
  id: function(str) {
    const idlist = this.query('idlist');
    return Array.isArray(idlist) && (idlist.indexOf(str)>=0);
  },
  name: function(raw) {
    const str = this.query('name');
    return str ? str : this.constructor.name;
  },
  short: function(raw) {
    return this.query('short', 1) || this.name(1);
  },
  long: function(raw) {
    return this.query('long', raw) || (this.name() + '看起来没有什么特别。\n');
  },

  // ======================
  // F_ENV
  absKey: function(key) {
    if(key[0] === '/') return key;
    return path.normalize(this._key + '/../' + key);
  },
  putInto: function(env) {
    const objs = env._objs;
    objs[this._key] = this;
    this._env = env;
  },
  removeFrom: function(env) {
    const objs = env._objs;
    if(objs[this._key]) delete objs[this._key];
    this._env = null;
  },
  environment: function(){
    return this._env;
  },
  inventory: function() {
    return this._objs;
  },
  looks: function() {
    return {
      type: this.constructor.name,
      short: this.short(),
      long: this.long(),
    }
  },
  looksInside: function() {
    const objs = {};
    for(const key in this._objs) {
      objs[key] = this._objs[key].short();
    }
    return {
      type: this.constructor.name,
      short: this.short(),
      long: this.long(),
      objects: objs,
    }
  },

  // ======================
  // actions
  addAction: function(key, action) {
    if(typeof action === 'string' && action.indexOf('function') === 0) {
      try {
        action = eval(action);
        this._actions[key] = action;
      } catch(e) {
      }
    }
    if(typeof action === 'function') {
      this._actions[key] = action;
    } else {
      this.world.log('Error: ' + this._key + '->' + 'addAction: ' + action);
    }
  },
  removeAction: function(key) {
    delete this._actions[key];
  },

  // ======================
  // F_MOVE
  queryMaxEncumb: function() {
    return this.query('max_encumb') || 0;
  },
  queryMaxInventory: function() {
    return this.query('max_inventory') || 0;
  },
  setMaxEncumb: function(v) {
    this.set('max_encumb', v);
    return this;
  },
  setMaxInventory: function(v) {
    this.set('max_inventory', v);
    return this;
  },
  queryWeight: function() {
    return this.query('weight') || 0;
  },
  queryEncumb: function() {
    return this.query('encumb') || 0;
  },
  weight: function() {
    return this.queryWeight() + this.queryEncumb();
  },
  setWeight: function(w) {
    const env = this.environment();
    if(env) env.addEncumb(w - this.query('weight'));
    this.set('weight', w);
  },
  addEncumb: function(w) {
    this.set('encumb', (this.query('encumb') || 0) + w);
    const env = this.environment();
    env.addEncumb(w);
  },
  receiveObject: function(ob, fromInventory, player) {
    if(!fromInventory && (this.query('encumb')+this.weight() > this.query('max_encumb'))) {
      return player.
    }

    const items = this.inventory();
    let n = 0;
    for(const i in items) n ++;
    const maxInv = this.queryMaxInventory();
    if(maxInv>0 && n>=maxInv) {
    }
  },
  
  // ======================
  // will be called when initialize after setData()
  setup: function() {
    const world = this._world;

    // objects
    const objects = this.query('objects');
    if(objects && typeof objects === 'object') {
      for(var key in objects) {
        const count = objects[key];
        for(let i=0; i<count; i++) {
          const obj = world.cloneObject(key);
          if(obj) obj.putInto(this);
        }
      }
    }

    // actions
    const actions = this.query('actions');
    if(typeof actions === 'object') {
      for(var key in actions) 
        this.addAction(key, actions[key]);
    }

  },
  cleanup: function() {
    // actions
    const actions = this._actions;
    for(const key in actions) {
      delete actions[key];
    }
    this._actions = {};

    // objects
    const objs = this._objs;
    for(const key in objs) {
      const obj = objs[key];
      obj.destruct();
      delete objs[key];
    }
    this._objs = {};
  },

});