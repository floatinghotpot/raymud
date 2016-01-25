'use strict';

import { Player } from './models/char.js';
import { Room } from './models/room.js';

const player = new Player();

const room = new Room();

player.move(room);
