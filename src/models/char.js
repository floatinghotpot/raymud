'use strict';

import { Obj } from './obj.js';

export class Char extends Obj {

}

export class Player extends Char {
  constructor() {
    super();
  }
  write(str) {
    // TODO: send str to player
    return str;
  }
}

export class NPC extends Char {

}
