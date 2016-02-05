'use strict';

var Class = require('mixin-pro').createClass;
var Lang = require('../../lang.js');
var ITEM = require('./item.js');

var BOOK = Class(ITEM, {
  constructor: function BOOK() {
  },

  studyOb: function(player) {
    if(player.isBusy())
      return player.notifyFail('你正忙着其他事呢！\n');
    if(player.isFighting())
      return player.notifyFail('你还是先应付眼前的敌人吧！\n');

    var need = this.query('required');
    if(need) {
      var reqAttr = need.attribute;
      if(typeof reqAttr === 'object') {
        for(var i in reqAttr) {
          if(player.queryDeep('attribute/'+i) < reqAttr[i]) {
            player.write('你的' + Lang.toChinese(i) + '不够，所以这上面记载的内容完全无法体会。\n');
            return 1;
          }
        }
      }
      var reqSkill = need.skill;
      if(typeof reqSkill === 'object') {
        for(var j in reqSkill) {
          if(player.queryDeep('skill/'+j) < reqSkill[j]) {
            player.write('你在' + Lang.toChinese(j) + '上的造诣还不够理解这上面记载的内容。\n');
            return 1;
          }
        }
      }

      var content = this.query('content');
      if(!content) {
        return player.notifyFail('这上面没有记载什么有用的内容。\n');
      }
      var toLearn = 0;
      for(var k in content) {
        if(player.queryDeep('skill/'+k) < content[k]) toLearn++;
      }
      if(!toLearn) {
        player.write('这上面记载的内容对你而言都了无新意。\n');
        return 1;
      }

      player.startBusy(this.studyContent, this.haltStudy);

      var msg = this.query('study_msg');
      if(!msg) msg = '$N开始聚精会神地研读' + this.name() + '上面的内容。\n';
      player.vision('vision', msg, player);
      return 1;
    }
  },

  studyContent: function(player) {
    var content = this.query('content');
    if(!content) return 0;

    var contentSize = 0;
    for(var i in content) {
      contentSize++;
    }
    if(!contentSize) return 0;

    // 使用读书识字的技能
    var skill = player.queryDeep('skill/literate');

    // 耗费精神 1-10 点
    var cost = 1 + (9 - player.queryDeep('attribute/wis')/3);
    if(cost < 1) cost = 1;

    var stat = player.query('stat');
    if((stat.sen < cost) || (stat.gen < cost) || (stat.fatigue >= stat.max_fatigue)) {
      player.write('你觉得精神不济，无法再继续研读了。\n');
      return 0;
    }

    player.consumeStat('gin', cost);
    player.consumeStat('sen', cost);

    var gain = 0;
    var point = player.queryAttr('int') / contentSize;
    for(var t in content) {
      var max = content[t];
      if(max < skill) max = skill;
      if(player.querySkill(t, 1) < content[i] && Math.random()*(point+skill) >= max/2) {
        player.improveSkill(t, 1 + Math.round(Math.random() * point));
        gain++;
      }
    }

    if(gain) {
      player.improveSkill('literate', 1 + Math.round(Math.random() * player.queryAttr('int')));
      player.supplementStat('fatigue', gain);
      player.damageStat('sen', gain);
    }

    return 1;
  },

  haltStudy: function(player) {
    var msg = this.query('halt_msg');
    if(!msg) msg = ('你停止研读' + this.name() + '上面记载的内容。\n');
    player.write(msg);
    return 1;
  },

});

exports = module.exports = BOOK;
