'use strict';

const test = require('tape');

import { F_CLEAN_UP, F_DBASE, F_MOVE, F_NAME } from '../models/feature/base.js';

test('F_DBASE', (t) => {
  t.plan(1);

  const item = new F_DBASE();
  item.set('name', 'bottle');
  t.equal(item.query('name'), 'bottle');
});

test('F_MOVE', (t) => {
  t.plan(2);

  const item = new F_MOVE();

  item.setMaxEncumb(100);
  t.equal(item.queryMaxEncumb(), 100);

  item.setMaxInventory(100);
  t.equal(item.queryMaxInventory(), 100);
});
