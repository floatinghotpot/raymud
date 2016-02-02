'use strict';

var Class = require('mixin-pro').createClass;
var OBJ = require('./obj.js');

var ROOM = Class(OBJ, {
  constructor: function ROOM() {
  },

  setup: function() {
    var world = this._world;

    // objects
    var objects = this.query('objects');
    if(objects && typeof objects === 'object') {
      for(var key in objects) {
        var count = objects[key];
        for(let i=0; i<count; i++) {
          var obj = world.cloneObject(key);
          if(obj) {
            obj.putInto(this);
          }
        }
      }
    }

    this.Super('setup').apply(this, arguments);
  },
});

exports = module.exports = ROOM;
