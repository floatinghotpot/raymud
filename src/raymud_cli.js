#!/usr/bin/env node

'use strict';

import { LoginServer } from './loginserver.js';
import { WorldServer } from './worldserver.js';
import { conf } from './raymud.conf.js';

var args = require('minimist')(process.argv.slice(2));

if(args.p) conf.server.port = args.p;
if(args.h) conf.server.host = args.h;

if(args.m) conf.mongodb = args.m;

if(args.r) {
  const words = args.r.split(':');
  if(words[0]) conf.redis.host = words[0];
  if(words[1]) conf.redis.port = parseInt(words[1]);
}

const server = new LoginServer(conf).startup();

const world = new WorldServer(conf).startup();
