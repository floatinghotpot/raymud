'use strict';

// translation here
const _lang = {
  
};

export const Lang = {
  toChinese: function(en) {
    return _lang[en] || en;
  },
  chineseNumber: function(n) {
    return n;
  },
};
