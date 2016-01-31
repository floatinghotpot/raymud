'use strict';

const _inn = {
  short: '小客栈',
  long: '这里是一家小客栈，老旧的<a cmd=\'look desk\'>桌椅</a>因为经年的使用而变得乌黑黝亮。<a cmd=\'look west\'>西边</a>隔着一层<a cmd=\'look curtain\'>竹帘</a>，隐隐传来一阵阵锅铲得声音，大概是客栈的厨房，靠北边的墙壁边上有一道通往二楼雅座的<a cmd=\'look stair\'>楼梯</a>，楼梯下就是<a cmd=\'look counter\'柜台</a>。<a cmd=\'look east\'>东边</a>是客栈的出口，门口一串纸糊<a cmd=\'look lantern\'>灯笼</a>随风摇摆，上面写着「饮风客栈」，意思是即使你没有钱，也欢迎来这里聊天听书，喝西北风。西南边有一扇木门，通往客栈后面的马房。',
  objects: {
    //'npc/waiter': 1,
    //'npc/innkeeper': 1,
  },
  valid_entry: 1,
  no_fight: 1,
  detail: {
    'lantern': '一串纸糊的大灯笼高高地挂在屋前的旗杆上，共是五个，分别写着「饮风客栈」四个大字，最下面的灯笼画着一个葫芦。',
    'desk': '这些桌椅零零散散地放置在客栈的厅中，看来相当老旧了。',
    'curtain': '竹帘用来隔开客人用膳跟厨房的炉灶，但是挡不住从厨房飘出来的香气。',
    'stair': '这道楼梯通往二楼的雅座跟客房',
    'counter': '柜台后面陈列着一坛坛贴着红纸条的<a cmd=\'look winejar\'>酒缸</a>，这些是客栈掌柜视如性命的陈年老酒，如果你有兴趣，不妨问问掌柜有关这些陈年老酒卖是不卖。',
    'winejar': '你仔细地瞧了瞧酒缸上贴的红纸，不得了，有延德年间的高粱，京城廖麻子酒坊火漆封印的「拔舌酒」，有四季红的「一品醉美人」，还有好几坛贴着「西郊大鼓楼」的陈年老酒。',
    //'west': ['lookDoor', 'west'],
    'east': ['lookDoor', 'east'],
  },
  exits: {
    //west: 'inn_kitchen',
    east: 'square',
  },
};

const _square = {
  short: '广场中央',
  long: '这里是雪亭镇广场的中央，一株巨大的<a cmd="look tree">老榕树</a>盘根错节地站在中央，一些孩童常常<a cmd="climb tree">爬</a>上这棵老榕树嬉戏，榕树下七横八竖地放着几张<a cmd="look bench">长凳</a>供人歇息聊天，树旁还有个水缸供路人取水解渴。',
  objects: {
    //'item/pot': 1,
    //'npc/gammer': 1,
    //'npc/junkman': 1,
  },
  detail: {
    'tree': '这株榕树少说也有两三百岁了，一条条长长的须根几乎垂到地面，树干因为经常被人抚摸而显得光滑。',
    'bench': '十分普通常见的长凳，如果你累了，不必客气，尽管坐下来休息。',
  },
  exits: {
    west: 'inn_hall',
    //west: 'sqare_w',
    //south: 'sqare_s',
    //east: 'sqare_e',
    //north: 'sqare_n',
  },
  actions: {
    climb: `function(me, args) {
      if(args !== 'tree') return 0; 
      me.vision('$N攀着榕树的树干爬了上去。\n', me);
      if(me.move('snow/tree')) {
        me.vision('$N从树下爬了上来。\n', me);
      }
      return 1;
    }`,
  },
};

const _tree = {
  short: '榕树上',
  long: '你现在正在一株巨大的榕树上，茂密的枝叶搔得你有些发痒，前面一根粗大的树枝上有人放着一块垫子。',
  objects: {
    //'npc/child': 1,
  },
  exits: {
    down: 'square',
  },
};

exports = module.exports = {
  area: '/snow',
  rooms: {
    'inn': _inn,
    'square': _square,
    'tree': _tree,
  },
  objects: {
    //'npc/inn_keeper': _inn_keeper,
    //'npc/waiter': _waiter,
    //'npc/gammer': _gammer,
    //'npc/child': _child,
    //'npc/junkman': _junkman,
    //'items/pot': _pot,
  },
};
