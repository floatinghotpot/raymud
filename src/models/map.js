'use strict';

var Class = require('mixin-pro').createClass;

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

export const MAP = Class({
  constructor: function MAP(mapInfo) {
    this._mapInfo = mapInfo;
  },
  setup: function(world) {
    const info = this._mapInfo;
    const rooms = info.rooms;
    const objects = info.objs;

    let area = info.area || '/';
    if(area[area.length-1] !== '/') area = area + '/';

    for(var key in objects) {
      const proto = objects[key];
      if(typeof proto !== 'function') throw new Error('proto not a function/class: ' + key);
      world.loadProto(area + key, proto);
    }

    for(var key in rooms) {
      const proto = rooms[key];
      const room = world.loadRoom(area + key, proto);
    }
  },
});
