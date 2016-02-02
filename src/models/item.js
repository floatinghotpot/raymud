'use strict';

var Class = require('mixin-pro').createClass;

var OBJ = require('./obj.js');

var ITEM = Class(OBJ, {
  constructor: function ITEM() {
    if(!this.query('unit')) this.set('unit', '个');
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
