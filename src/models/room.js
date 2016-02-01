'use strict';

const Class = require('mixin-pro').createClass;

import { OBJ } from './obj.js';

export const ROOM = Class(OBJ, {
  constructor: function ROOM() {
  },
  setup: function() {
    // objects
    const objects = this.query('objects');
    if(objects && typeof objects === 'object') {
      for(var key in objects) {
        const count = objects[key];
        for(let i=0; i<count; i++) {
          const obj = world.cloneObject(key);
          if(obj) {
            obj.putInto(this);
          }
        }
      }
    }
    this.Super('setup').apply(this, arguments);
  },

  // when looks from another room, cannot see details
  looksOutside: function() {
    return {
      type: this.constructor.name,
      short: this.short(),
      long: this.long(),
    };
  },
});
