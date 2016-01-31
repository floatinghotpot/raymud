'use strict';

export const conf = {
  server: {
    host: '0.0.0.0',
    port: 7000,
    hello_msg: '欢迎阅读互动小说［武林传奇III］',
    server: 20160129,
    client_req: 20160129,
  },
  mongodb: 'mongodb://localhost:27017/es3',
  redis: {
    host: 'localhost',
    port: 6379,
    passwd: null,
  },
  world: [
    'world/common.js',
    'world/snow.js',
  ],
  new_user: {
  },
  new_char: {
    'money/coin': 1000,
    score: 1,
    level: 1,
    exp: 0,
  },
  entries: [
    '/snow/inn_hall',
  ],
};
