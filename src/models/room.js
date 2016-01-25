'use strict';

import { Obj } from './obj.js';
import { Char, Player } from './char.js';

export class Room extends Obj {
  constructor() {
    super();
    this._doors = {};
    this._guards = {};
  }

  cleanUp(inheritFlag) {
    const items = this.queryTemp('objects');
    if(items) {
      for(let i=items.length-1; i>=0; i--) {
        const ob = items[i];
        if((ob instanceof Char) && (ob.env() === this)) return true;
      }
    }
    return super.cleanUp(inheritFlag);
  }

  remove(thisPlayer) {
    let cnt = 0;
    const items = this.queryTemp('objects');
    for(let i=items.length-1; i>=0; i--) {
      const ob = items[i];
      if(ob.objectp() && (ob instanceof Char)) {
        const env = ob.env();
        if(env !== this) {
          env.message('vision', `一阵强烈的闪光忽然出现，吞没了${ob.name()}。\n`);
          ob.destruct();
          items.splice(i, 1);
          cnt++;
        }
      }
    }
    if(cnt && thisPlayer && (thisPlayer instanceof Player)) {
      thisPlayer.write(`WARNNING: ${cnt} wandering NPC(s) created by this room are forced destructed.\n`);
    }
  }

  reset() {
    const obList = this.query('objects');
    if(obList) {
      let ob = this.queryTemp('objects');
      if(!ob) ob = {};
      for(const key in obList) {
        const amount = obList[key];
        // TODO:
        if(amount === 1) {
          break;
        } else {
          break;
        }
      }
      this.setTemp('objects', ob);
    }
  }
}
