'use strict';

import { SYSTEM, USER } from './models/system.js';
import { ROOM } from './models/std/room.js';
import { ITEM, CONTAINER_ITEM } from './models/std/item.js';

var room = new ROOM();

var user = new USER();
user.move(room);

var bag = new CONTAINER_ITEM();
bag.move(user);

var item = new ITEM();
item.move(bag);

