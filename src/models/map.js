'use strict';

/*
// example of map info

var mapInfo = {
  area: '/snow',
  rooms: {
    'square': _square,
    'tree': _tree,
  },
  objects: {
    'npc/gammer': _gammer,
    'npc/child': _child,
    'npc/junkman': _junkman,
    'item/pot': _pot,
  },
}
*/

var Class = require('mixin-pro').createClass;

var MAP = Class({
  constructor: function MAP(mapInfo) {
    this._mapInfo = mapInfo;
  },
  setup: function(world) {
    var info = this._mapInfo;
    var rooms = info.rooms;
    var objects = info.objs;

    var area = info.area || '/';
    if(area[area.length-1] !== '/') area = area + '/';

    for(var i in objects) {
      var proto = objects[i];
      if(typeof proto !== 'function') throw new Error('proto not a function/class: ' + i);
      world.loadProto(area + i, proto);
    }

    for(var j in rooms) {
      world.loadRoom(area + j, rooms[j]);
    }
  },
});

exports = module.exports = MAP;
