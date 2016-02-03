'use strict';

var Class = require('mixin-pro').createClass;

var OBJ = require('./obj.js');

var ITEM = Class(OBJ, {
  constructor: function ITEM() {
    if(!this.query('unit')) this.set('unit', '个');
  },

  // ======================
  // F_MOVE
  queryMaxEncumb: function() {
    return this.query('max_encumb') || 0;
  },
  queryMaxInventory: function() {
    return this.query('max_inventory') || 0;
  },
  setMaxEncumb: function(v) {
    this.set('max_encumb', v);
    return this;
  },
  setMaxInventory: function(v) {
    this.set('max_inventory', v);
    return this;
  },
  queryWeight: function() {
    return this.query('weight') || 0;
  },
  queryEncumb: function() {
    return this.query('encumb') || 0;
  },
  weight: function() {
    return this.queryWeight() + this.queryEncumb();
  },
  setWeight: function(w) {
    var env = this.environment();
    if(env) env.addEncumb(w - this.query('weight'));
    this.set('weight', w);
  },
  addEncumb: function(w) {
    this.set('encumb', (this.query('encumb') || 0) + w);
    var env = this.environment();
    env.addEncumb(w);
  },
  receiveObject: function(ob, fromInventory, player) {
    if(!fromInventory && (this.query('encumb')+this.weight() > this.query('max_encumb'))) {
      return player.notifyFail(ob.name() + '太重了。\n');
    }

    var items = this.inventory();
    var n = _.size(items);
    var maxInv = this.queryMaxInventory();
    if(maxInv>0 && n>=maxInv) {
      return player.notifyFail(this.name() + '装不下了。\n');
    }
  },

  move: function(dest, silently, player) {
    if(this.query('equipped') && !(this.unequp())) {
      return player.notifyFail('你没办法取下这样东西。\n');
    }

    switch(typeof dest) {
    case 'object':
      break;
    case 'string':
      dest = this._world.loadObject(this.absKey(dest));
      break;
    default:
      player.notifyFail('move: invalid destination, expected: object or string, got: ' + dest);
    }

    // Check if the destination is our environment ( or environment of
    // environment ..., recursively ). If so, encumbrance checking is omited.
    var env = this;
    while((env = env.environment())) if(env === dest) break;
    if(!dest) return 0;
    if(!dest.receiveObject(this, env, player)) return 0;

    // Move the object and update encumbrance
    var w = this.weight();
    env = this.environment();
    if(env) env.addEncumb(-w);

    this.putInto(dest);

    // The destination might self-destruct in init(), check it before we
    // do environment maintains.
    env = this.environment();
    if(!env) return 0;

    env.addEncumb(w);
    return 1;
  },

});

var CONTAINER_ITEM = Class(ITEM, {
  constructor: function CONTAINER_ITEM() {
    if(!this.query('exits')) {
      // this.environment is a function, call it in the instance
      this.setDeep('exits/out', 'env' );
    }
  },
  acceptObject: function() {
    return 1;
  },
  holdObject: function() {
    return this.query('closed');
  },
  looksInside: function() {
    var myLooks = this.Super('looks').apply(this, arguments);

    myLooks.long = this.query('inside_long') || '';
    if(!myLooks.long) myLooks.long = ('你现在正在一' + this.query('unit') + this.name() + '里。\n');
    if(!this.query('closed') && this.queryDeep('exits/out')) {
      myLooks.long += '你可以<a cmd=\'go out\'>向外离开</a>这里。\n';
    }

    if(this.query('transparent') && this.environment()) {
      myLooks.long += '从这里你可以看到外面：\n';
      var envLooks = this.environment().looks();
      myLooks.long += envLooks.long;
    }

    return myLooks;
  },
});

var COMBINED_ITEM = Class(ITEM, {
  constructor: function COMBINED_ITEM() {
  },
  queryAmount: function() {
    return this.query('amount');
  },
  setAmount: function(v) {
    if(v <= 0) {
      this.destruct();
    } else {
      this.set('amount', v);
      this.set('weight', v * (this.query('base_weight') || 0));
    }
  },
  addAmount: function(v) {
    this.setAmount(this.query('amount') + v);
  },
  short: function(raw) {
    var short = this.Super('short').call(this, raw);
    if(raw) return short;
    return this.query('amount') + (this.query('base_unit') || '') + short;
  },
  move: function(dest, silent) {
    if(!this.Super('move').call(this, dest, silent)) return 0;

    // combine same items
    var myProtoKey = this._key.split('#')[0];
    var env = this.environment();
    var items = env.inventory();
    for(var i in items) {
      if(this === obj) continue;
      var obj = items[i];
      if(obj._key.split('#')[0] === myProtoKey) {
        this.addAmount(obj.queryAmount());
        obj.destruct();
      }
    }
    return 1;
  },

  setup: function(){
    this.Super('setup').apply(this, arguments);
    if(!this.query('amount')) this.set('amount', 1);
    this.set('value', Math.floor(this.query('base_value') * this.query('amount')));
  },

});

exports = module.exports = {
  ITEM: ITEM,
  CONTAINER_ITEM: CONTAINER_ITEM,
  COMBINED_ITEM: COMBINED_ITEM,
};
