'use strict';

var items = require('./models/items.js');

exports = module.exports = {
  OBJ: require('./models/obj.js'),
  USER: require('./models/user.js'),
  CHAR: require('./models/char.js'),
  ROOM: require('./models/room.js'),
  MAP: require('./models/map.js'),
  ITEM: items.ITEM,
  CONTAINER_ITEM: items.CONTAINER_ITEM,
  COMBINED_ITEM: items.COMBINED_ITEM,
  LoginServer: require('./login-server.js'),
  WorldServer: require('./world-server.js'),
};
