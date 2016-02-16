## History of MUD

传统的盛行一时的MUD，不论是侠客行、西游记，都是从 ES2（新东方故事II）衍生而来，都是基于MudOS驱动、用 LPC 开发而成，使用 Telnet 登录访问。其技术没有随时代演进，这也是 MUD 小众的原因之一。

* [中国MUD的发展历史／History of MUD](https://github.com/floatinghotpot/raymud/tree/master/docs/HISTORY.md)

MUD文字网游虽然小众，但其魅力不减。文字阅读带来的想象空间，依然是令许多玩家着迷之处。手游时代，也有些类似MUD文字元素的游戏，获得玩家的好评，例如《地下城堡》、《挂机游戏》等。

## Introduction

RayMUD is a web-based MUD game engine.

Instead of using traditional MudOS driver, RayMud is powered by new technologies like javascript, node.js, websocket, mongodb, and redis. It can run smoothly on browsers (PC, mobile, APP embedded), and easier for montimization.

RayMUD 是基于Web的新一代MUD游戏引擎：

* 以 node.js / javascript 开发，前端、后台均用同一语言开发。
* 以 mongodb NOSQL 数据库作为持久化数据存储。
* 以 Redis 作为高速缓存和消息派发，实现分布式架构。
* 以 HTTP / websocket 作为主要的通讯协议。

基于 RayMUD 开发的MUD游戏，可以运行于PC浏览器、手机浏览器、微信／QQ内置浏览器等，具有更广泛的适应性与传播性，也更容易与移动支付、移动广告等变现手段集成，更加易于商业化。

RayMUD项目，尝试以全新的技术架构、移动终端平台、社交化传播方式来演绎经典，带来武侠、悬疑的互动小说阅读新体验。

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
