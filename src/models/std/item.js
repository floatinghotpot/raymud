'use strict';

const mixin = require('mixin');

import { F_DBASE, F_MOVE, F_CLEAN_UP, F_NAME } from '../feature/base.js';

// F_ITEM

let _ITEM = function() {
  if(!this.query('unit')) this.set('unit', '个');
};

_ITEM = mixin(_ITEM, F_DBASE);
_ITEM = mixin(_ITEM, F_MOVE);
_ITEM = mixin(_ITEM, F_CLEAN_UP);
export const F_ITEM = mixin(_ITEM, F_NAME);

