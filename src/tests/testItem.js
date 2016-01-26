'use strict';

const test = require('tape');

import { F_ITEM } from '../models/std/item.js'

test('item', (t) => {
  t.plan(1);

  const item = new F_ITEM();
  item.setName('瓶子', ['bottle']);
  t.equal(item.query('name'), '瓶子');
});
