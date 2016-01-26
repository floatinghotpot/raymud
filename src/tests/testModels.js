'use strict';

const test = require('tape');
const mixin = require('mixin-pro');

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

test('multiple inheritance with mixin and class extends', (t) => {
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
