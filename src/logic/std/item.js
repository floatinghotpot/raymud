'use strict';
const Class = require('mixin-pro').createClass;

import { F_DBASE, F_MOVE, F_CLEAN_UP, F_NAME } from '../feature/base.js';

// F_ITEM

export const ITEM = Class([F_DBASE, F_MOVE, F_CLEAN_UP, F_NAME], {
  constructor: function ITEM( ){
    if(!this.query('unit')) this.set('unit', '个');
  },
});

export const CONTAINER_ITEM = Class(ITEM, {
  constructor: function CONTAINER_ITEM() {
    if(!this.query('exits')) {
      // this.environment is a function, call it in the instance
      this.set('exits', { out: this.environment });
    }
  },
  acceptObject: function(player, ob) {
    return ob && true;
  },
  holdObject: function(ob) {
    return ob && this.query('closed');
  },
  doLook: function(me, arg) {
    const long = this.query('inside_long');
    if(long) USER.current().write(`你现在正在一${this.query('unit') + this.name()}里。\n`);
    if(!this.query('closed')) {
      const exits = this.query('exits');
      if(exits && exits.out) {
        USER.current().write('要离开这里可以用<CMD>go out</CMD>。\n');
      }
    }
    if(this.query('transparent')) {
      USER.current().write('从这里你可以看到外面：\n');
      this.environment().doLook(me, arg);
    }
  }
});

export const COMBINED_ITEM = Class(ITEM, {
  constructor: function COMBINED_ITEM() {
    this._amount = 1;
    this.set('value', parseInt(this.query('base_unit') * this._amount));
  },
  queryAmount: function() {
    return this._amount;
  },
  setAmount: function(v) {
    if(v < 0) USER.current().error('combine:set_amount less than 1.\n');
    if(v <= 0) SYSTEM.destruct(this);
    else {
      this._amount = v;
      this.set('weight', v * (this.query('base_weight') || 0));
    }
  },
  addAmount: function(v) {
    this.setAmount(this._amount + v);
  },
  short: function(raw) {
    var short = this.Super('short').call(this, raw);
    if(raw) return short;
    return SYSTEM.chineseNumber(this.queryAmount()) + (this.query('base_unit') || '') + short;
  },
  move: function(dest, silent) {
    if(!this.Super('move').call(this, dest, silent)) return false;

    const env = this.environment();
    if(env.instanceOf(CHARACTER)) {
      const items = env.allInventory();
      if(items) {
        for(let i=items.length-1; i>=0; i--) {
          const ob = items[i];
          if(this === ob) continue;
          if(ob.constructor === this.constructor) {
            this._amount += ob.queryAmount();
            items.splice(i, 1);
            SYSTEM.destruct(ob);
          }
        }
      }
    }
    return 1;
  },
});
