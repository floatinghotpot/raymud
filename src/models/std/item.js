'use strict';

const mixin = require('mixin');

import { F_DBASE, F_MOVE, F_CLEAN_UP, F_NAME } from '../feature/base.js';

// F_ITEM

let F_ITEM = () => {
  if(!this.query('unit')) this.set('unit', '个');
};

F_ITEM = mixin(F_ITEM, F_DBASE);
F_ITEM = mixin(F_ITEM, F_MOVE);
F_ITEM = mixin(F_ITEM, F_CLEAN_UP);
F_ITEM = mixin(F_ITEM, F_NAME);

export F_ITEM;

