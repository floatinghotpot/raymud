'use strict';

var path = require('path'),
  _ = require('underscore'),
  Class = require('mixin-pro').createClass;

var OBJ = Class({
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
    for(var prop in data) {
      if(prop.indexOf('/')>=0) {
        this.setDeep(prop, data[prop]);
      } else {
        this.set(prop, data[prop]);
      }
    }
  },
  queryData: function() {
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
  query: function(prop) {
    return this._data[prop];
  },
  add: function(prop, data) {
    var old = this.query(prop, 1);
    if(!old) return this.set(prop, data);
    if(typeof old === 'function') return old;
    return this.set(prop, old + data);
  },

  // setDeep('prop1/sub/sub2', data);
  setDeep: function(prop, data) {
    var words = prop.split('/');
    if(!this._data) this._data = {};
    var _data = this._data;
    var n = words.length -1;
    for(var i=0; i<n; i++) {
      var d = _data[words[i]];
      if(!d) d = _data[words[i]] = {};
      _data = d;
    }
    _data[words[n]] = data;
    return this;
  },
  // queryDeep('prop1/sub/sub2', data);
  queryDeep: function(prop) {
    var words = prop.split('/');
    var _data = this._data;
    var n = words.length -1;
    for(var i=0; i<n; i++) {
      var d = _data[words[i]];
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
    var idlist = this.query('idlist');
    return Array.isArray(idlist) && (idlist.indexOf(str)>=0);
  },
  name: function() {
    return this.query('name') || this.constructor.name;
  },
  short: function() {
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
    var objs = env._objs;
    objs[this._key] = this;
    this._env = env;
  },
  removeFrom: function(env) {
    var objs = env._objs;
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
    };
  },
  looksInside: function() {
    var objs = {};
    for(var key in this._objs) {
      objs[key] = this._objs[key].short();
    }
    return {
      type: this.constructor.name,
      short: this.short(),
      long: this.long(),
      objects: objs,
    };
  },

  // ======================
  // actions
  addAction: function(key, action) {
    if(typeof action === 'string' && action.indexOf('function') === 0) {
      try {
        action = eval(action);
        this._actions[key] = action;
      } catch(e) {
        return;
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
  // will be called when initialize after setData()
  setup: function() {
    var world = this._world;

    // objects
    var objects = this.query('objects');
    if(objects && typeof objects === 'object') {
      for(var key in objects) {
        var count = objects[key];
        for(var i=0; i<count; i++) {
          var obj = world.cloneObject(key);
          if(obj) obj.putInto(this);
        }
      }
    }

    // actions
    var actions = this.query('actions');
    if(typeof actions === 'object') {
      for(var j in actions)
        this.addAction(j, actions[j]);
    }
  },

  cleanup: function() {
    // actions
    var actions = this._actions;
    for(var key in actions) {
      delete actions[key];
    }
    this._actions = {};

    // objects
    var objs = this._objs;
    for(var i in objs) {
      var obj = objs[i];
      delete objs[i];
      obj.destruct();
    }
    this._objs = {};
  },

});

exports = module.exports = OBJ;
