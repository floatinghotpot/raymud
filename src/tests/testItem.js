'use strict';

const test = require('tape');

import { F_ITEM } from '../models/std/item.js'

test('item', (t) => {
  t.plan(1);

  const item = new F_ITEM();
  item.setName('bottle');
  t.equal(item.query('name'), 'bottle');
});
