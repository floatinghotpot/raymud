exports = module.exports = {
  server: {
    host: '0.0.0.0',
    port: 7000,
    hello_msg: '江湖梦、侠客行。欢迎进入『我的武林』。\n阅读、互动，手机触屏操作全新演绎 MUD 游戏经典。',
    version: 20160129,
    client_req: 20160129,
  },
  mongodb: 'mongodb://localhost:27017/es3',
  redis: {
    host: 'localhost',
    port: 6379,
    passwd: null,
  },
  www: './www/',
  world: [
    './world/common.js',
    './world/snow.js',
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
