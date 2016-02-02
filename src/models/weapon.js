'use strict';

var Class = require('mixin-pro').createClass;
var ITEM = require('./item.js');

var WEAPON = Class(ITEM, {
  constructor: function WEAPON() {
  },
});

exports = module.exports = WEAPON;
