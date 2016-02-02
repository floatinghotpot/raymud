#!/usr/bin/env node

'use strict';

var LoginServer = require('./login-server.js');
var WorldServer = require('./world-server.js');
var conf = require('../conf/raymud.conf.js');

var args = require('minimist')(process.argv.slice(2));

if(args.p) conf.server.port = args.p;
if(args.h) conf.server.host = args.h;

if(args.m) conf.mongodb = args.m;

if(args.r) {
  var words = args.r.split(':');
  if(words[0]) conf.redis.host = words[0];
  if(words[1]) conf.redis.port = parseInt(words[1]);
}

var world = new WorldServer(conf).startup();

var server = new LoginServer(conf).startup();
