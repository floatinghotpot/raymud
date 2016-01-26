'use strict';

const test = require('tape');
const mixin = require('mixin');

const A = function() {
  this._va = 0;
};
A.prototype = {
  fa() {
    this._xa = 0;
  },
};

const B = function() {
  this._vb = 0;
};
B.prototype = {
  fb() {
    this._xb = 0;
  },
};

let C = function() {
  this._vc = 0;
};
C.prototype = {
  fc() {
    this._xc = 0;
  },
};

C = mixin(C, A);
C = mixin(C, B);

class D extends C {
  constructor(){
    super();
    this._vd = 0;
  }
  fd() {
    this.fa();
    this.fb();
    this.fc();
    this._xd = 0;
  }
}

test('multiple inheritance', (t) => {
  t.plan(12);

  const d = new D();

  t.equal(d instanceof D, true);
  t.equal(d instanceof C, true);
  t.equal(d instanceof B, false);
  t.equal(d instanceof A, false);

  t.equal(d._va, 0);
  t.equal(d._vb, 0);
  t.equal(d._vc, 0);
  t.equal(d._vd, 0);

  d.fd();

  t.equal(d._xa, 0);
  t.equal(d._xb, 0);
  t.equal(d._xc, 0);
  t.equal(d._xd, 0);

});

import { Obj } from '../models/obj.js';
import { Item, Container } from '../models/item.js';
import { Char, NPC, Player } from '../models/char.js';
import { Room } from '../models/room.js';

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
