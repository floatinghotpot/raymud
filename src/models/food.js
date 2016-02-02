'use strict';

var Class = require('mixin-pro').createClass;

var ITEM = require('./item.js');

// Any drink should either inherit LIQUID or define these functions.
// queryVolume()
// addVolume()

var FOOD = Class(ITEM, {
  constructor: function FOOD() {},

  queryValume: function() {
  },

  addVolume: function() {
  },

  drinkOb: function(me) {
    var stuff, heal, alcohol;

    stuff = me.queryStatMaximum('water') / 3;

    var stat = me.queryStat('water');
    var statMax = me.queryStatMax('water');
    if(stuff + stat > statMax)
      stuff = statMax - stat;
    if(stuff <= 0) return me.notifyFail('你已经涨得喝不下一滴水了。\n');

    me.supplementStat('water', stuff);
    me.vision('vision', '$N从' + this.environment().name() + '喝了几口' + this.name() + '。\n', me);

    // if( (alcohol = this.query("alcohol")) > 0 )
    //    CONDITION_D("drunk").applyDrunk( me, parseInt( alcohol * stuff ));

    // add_volume could destruct ourself once volume becomes zero, call it last!
    this.addVolume(-stuff*10);

    return 1;
  },

  stuffOb: function(me) {
    var stuff, heal;

    stuff = this.query('food_stuff');
    if(!stuff) return 0;

    if(stuff + me.queryStat('food') > me.queryStatMax)
      return me.notifyFail('你的肚子已经装不下这' + this.query('unit') + this.name() + '了。\n');

    me.supplementStat('food', stuff);
    me.vision('vision', '$N吃下一' + this.query(this.queryAmount() ? 'base_unit' : 'unit') + this.name() + '。\n', me);

    if((heal = this.query('heal_gin')) && me.supplementStat('gin', heal))
      me.write('你吃了一些营养的食物，恢复了一些体力。\n');

    if((heal = this.query('heal_kee')) && me.supplementStat('kee', heal))
      me.write('你吃了一些营养的食物，觉得气力恢复了一些。\n');

    if((heal = this.query('heal_sen')) && me.supplementStat('sen', heal))
      me.write('你觉得清醒多了。\n');

    if(this.queryAmount())
      this.addAmount(-1);
    else
      this.destruct();

    return 1;
  },
});

exports = module.exports = FOOD;
