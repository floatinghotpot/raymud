'use strict';

import { Obj } from '../models/obj.js';
import { Item, Container } from '../models/item.js';
import { Char, NPC, Player } from '../models/char.js';
import { Room } from '../models/room.js';

const test = require('tape');

test('obj', (t) => {
  t.plan(2);
  const obj = new Obj();
  t.equal(obj.is(Obj), true);
  t.equal(obj.constructor.name, 'Obj');
});

test('container', (t) => {
  t.plan(3);

  const world = new Obj();

  const container = new Container();
  t.equal(container instanceof Item, true);

  const room = new Room();
  room.move(world);

  const npc = new NPC();
  const player = new Player();
  t.equal(npc.is(Char), true);
  t.equal(player instanceof Char, true);

  npc.move(room);
  player.move(room);

});
