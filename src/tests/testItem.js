'use strict';

const test = require('tape');

import { SYSTEM, USER } from '../models/system.js';
import { ROOM } from '../models/std/room.js';
import { ITEM, CONTAINER_ITEM } from '../models/std/item.js';

test('ITEM', (t) => {
  t.plan(1);

  var room = new ROOM();
  room.set('short', '客栈');

  var user = new USER();
  user.set('short', '张三');
  user.move(room);

  var bag = new CONTAINER_ITEM();
  bag.setName('挂包', ['bag']);
  bag.move(user);

  var item = new ITEM();
  item.move(bag);

  item.setName('瓶子', ['bottle']);
  t.equal(item.query('name'), '瓶子');
});
