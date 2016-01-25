'use strict';

import { Obj } from './obj.js';
import { Char } from './char.js';
import { Lang } from './lang.js';

export class Item extends Obj {
  constructor(env) {
    super();
    this.set('env', env);
    if(!this.query('unit')) this.set('unit', '个');
  }
  env() {
    return this.query('env');
  }
}

export class Container extends Item {
  constructor(env) {
    super(env);
    if(!this.query('exits')) {
      this.set('exits', { out: env });
    }
  }
  acceptObject(player, ob) {
    return ob && true;
  }
  holdObject(ob) {
    return ob && this.query('closed');
  }
  doLook(player, arg) {
    const long = this.query('inside_long');
    if(long) player.write(`你现在正在一${this.query('unit') + this.name()}里。\n`);
    if(!this.query('closed')) {
      const exits = this.query('exits');
      if(exits && exits.out) {
        player.write('要离开这里可以用<CMD>go out</CMD>。\n');
      }
    }
    if(this.query('transparent')) {
      player.write('从这里你可以看到外面：\n');
      this.env().doLook(player, arg);
    }
  }
}

export class Combined extends Item {
  constructor(env) {
    super(env);
    this._amount = 1;
  }
  queryAmount() {
    return this._amount;
  }
  setAmount(v) {
    if(v >= 0) this._amount = v;
    if(v === 0) this.destruct();
    else this.set('weight', v * (this.query('base_weight') || 0));
  }
  addAmount(v) {
    this.setAmount(this._amount + v);
  }
  short(raw) {
    if(raw) return super.short(raw);
    return Lang.chineseNumber(this.queryAmount()) + (this.query('base_unit') || '') + super.short(raw);
  }
  move(dest, silent) {
    if(!super.move(dest, silent)) return false;
    const env = this.env();
    if(env instanceof Char) {
      const items = env.inventory();
      if(items) {
        for(let i=items.length-1; i>=0; i--) {
          const ob = items[i];
          if(this === ob) continue;
          if(ob.constructor.name === this.constructor.name) {
            this._amount += ob.queryAmount();
            ob.destruct();
            items.splice(i, 1);
          }
        }
      }
    }
    return true;
  }
}
