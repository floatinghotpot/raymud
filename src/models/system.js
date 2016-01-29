'use strict';
const Class = require('mixin-pro').createClass;

// SYSTEM

const _classes = {};
const _objects = {};

export const SYSTEM = {
  shutdown: function() {
    // TODO: 

    // clean up objects & classes
    for(var i in _objects) delete _objects[i];
    for(var i in _classes) delete _classes[i];
  },

  registerClass: function(className, classDef) {
    _classes[className] = classDef;
  },

  unregisterClass: function(className) {
    delete _classes[className];
  },

  loadObject: function(className) {
    let obj = _objects[className];
    if(!obj) {
      const classDef = _classes[className];
      if(classDef) {
        obj = new classDef();
        _objects[className] = obj;
      }
    }
    return obj;
  },

  cloneObject: function(className) {
    const classDef = _classes[className];
    if(classDef) obj = new classDef();
    return obj;
  },

  callOther: function(className) {

  },

  destruct: function(ob) {
    // TODO: delete ob, remove ref, free memory
    const env = ob.environment && ob.environment();
    // env.remove(ob);

    const func = ob.onDestroy;
    if(typeof func === 'function') func();

    // TODO: destroy it
  },

  message: function(type, msg, env) {
    console.log(type, msg, env);
  },

  messageVision: function(msg, ob) {
    console.log(msg, ob);
  },

  tellObject: function(player, msg) {
  },

};

// USER

let _currentUser = null;

export const USER = Class({
  constructor: function USER() {
    _currentUser = this;
  },

  setCurrent: function() {
    _currentUser = this;
  },

  current: function() {
    return _currentUser;
  },

  startBusy: function(func1, func2) {
  },

  notifyFail: function(str) {
    console.log(str);
  },

  write: function(str) {
    console.log(str);
  },

  error: function(str) {
    console.log(str);
  },
});
