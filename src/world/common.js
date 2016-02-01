'use strict';

import { CHAR } from '../models/char.js';

exports = module.exports = {
  area: '/',
  rooms: {
    'void': {
      short: '无名之地',
      long: '你身处一片茫茫的迷雾中，什么都看不见。',
    },
  },
  objects: {
    'player': CHAR,
    // 'item/coin': _coin,
  },
};
