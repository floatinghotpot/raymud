'use strict';

const inherit = require('mixin-pro').inherit;

import { F_DBASE, F_MOVE, F_CLEAN_UP, F_NAME } from '../feature/base.js';

// F_ITEM

export const F_ITEM = inherit([F_DBASE, F_MOVE, F_CLEAN_UP, F_NAME], {
  constructor: function F_ITEM( ){
    if(!this.query('unit')) this.set('unit', '个');
  },
});
