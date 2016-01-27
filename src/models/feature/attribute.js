'use strict';

import { SYSTEM, USER } from '../system.js';

const Class = require('mixin-pro').createClass;

// define number of person attributes
export const NUM_ATTRIBUTES = 8;

// min / max value of attributes
export const ATTRVAL_MIN = 1;
export const ATTRVAL_MAX = 50;

export const F_ATTRIBUTE = Class({
  constructor: function F_ATTRIBUTE() {
    this._attribute = {};
  },

  queryAttribute: function() {
    return this._attribute;
  },

  queryAttr: function(what, raw) {
    var a;
    if(!this._attribute || (!(a = this._attribute[what]))) return 0;
    if(raw) return a;
    var tmp = this.queryTemp('apply');
    return a + (typeof tmp === 'object') ? tmp[what] : '';
  },

  setAttr: function(what, value) {
    if(!this._attribute) return 0;
    if(USER.current())
      && (!this._attrbute[what]) || value < ATTRVAL_MIN || value > ATTRVAL_MAX))
      return 0;
    
    return (this._attribute[what] = value);
  },

  initAttribute: function(base) {
    var attr, name, value;
    
    // if attribute configured, use its value for attribute
    if((attr = this.query('attribute'))) {
      this._attribute = attr;
      this.unset('attribute');
    }
    if(!this._attribute) this._attribute = {};

    // fill the value with preset values
    if(base && typeof base === 'object') {
      for(var i in base) {
        if(!this._attribute[i])
          this._attribute[i] = base[i];
      }
    }
  },
});
