'use strict';

var Class = require('mixin-pro').createClass;

var path = require('path'),
    redis = require('redis');

export const WorldServer = Class({
  constructor: function WorldServer(conf) {
    this.conf = conf;
    this.reset();
  },

  reset: function() {
    this.db = null;
    this.pub = null;
    this.sub = null;
    this.id = 0;
    this.timer = 0;
    this.isRunning = false;
    this.rooms = {};
    this.roomsCount = 0;
  },

  startup: function() {
    if(this.isRunning) throw new Error('server is already running.');
  },

  startInstance: function() {
  },

  shutdown: function() {
  },

  tick: function(){
  },
});
