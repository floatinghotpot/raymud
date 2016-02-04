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

  looksInside: function() {
    var world = this._world;

    var looks = this.Super('looksInside').apply(this, arguments);

    var exits = looks.exits = {};
    var e = this.query('exits');
    if(e && typeof e === 'object') {
      for(var dir in e) {
        var key = this.absKey(e[dir]);
        var room = world.rooms[key];
        if(room) exits[dir] = room.short();
      }
    }

    var detail = this.query('detail');
    if(detail) looks.detail = detail;

    return looks;
  },

  nextRoom: function(dir) {
    var e = this.query('exits');
    if(e && typeof e === 'object' && (dir in e)) {
      var key = this.absKey(e[dir]);
      return this._world.rooms[key];
    }
    return null;
  },
});

exports = module.exports = ROOM;
