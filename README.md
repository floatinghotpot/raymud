RayMud is a web-based MUD game engine.

## Dependency

* MongoDB is required, used as database.
* Redis is required, used as data cache and pub/sub message channel.

## Installation

```bash
npm install -g raymud
```

## Usage

```bash
mongod --dbpath /path/to/data/folder &

redis-server &

raymud &
```

## Credits

Created by Raymond Xie.
