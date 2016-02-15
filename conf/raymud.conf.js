exports = module.exports = {
  instanceId: 1,
  server: {
    host: '0.0.0.0',
    port: 7000,
    name: '『武林新传』',
    hello_msg: '全新武侠悬疑互动小说『武林新传』，致敬 MUD 游戏经典『东方故事II』。江湖梦，侠客行。刀光剑影，快意恩仇。欢迎体验。',
    version: 20160129,
    client_req: 20160129,
  },
  mongodb: 'localhost:27017/es3',
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
