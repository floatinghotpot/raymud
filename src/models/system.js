'use strict';

// SYSTEM

export const SYSTEM = () => {};

SYSTEM.destory = (ob) => {
  // TODO: delete ob, remove ref, free memory
  const env = ob.env && ob.env();
  // env.remove(ob);
};

SYSTEM.message = (type, msg, ob) => {
  
};

SYSTEM.messageVision = (msg, ob) => {
};

SYSTEM.chineseNumber = (n) => {
  return n;
};

// USER

let _currentUser = null;

export const USER = () => {
  _currentUser = this;
};

USER.current = () => {
  return _currentUser;
};

USER.prototype = {
  setCurent: () => {
    _currentUser = this;
  },
  notifyFail: (str) => {
    console.log(str);
  },
  write: (str) => {
    console.log(str);
  },
  error: (str) => {
    console.log(str);
  },
};

