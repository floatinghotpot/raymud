'use strict';

var snowInnHall = {
  short: '小客栈',
  long: '这里是一家小客栈，老旧的<a cmd=\'look desk\'>桌椅</a>因为经年的使用而变得乌黑黝亮。西边隔着一层<a cmd=\'look curtain\'>竹帘</a>，隐隐传来一阵阵锅铲的声音，大概是客栈的厨房。靠北边的墙壁边上有一道<a cmd=\'look stair\'>楼梯</a>，通往二楼的雅座，楼梯下就是<a cmd=\'look counter\'>柜台</a>。东边是客栈的出口，门口一串纸糊<a cmd=\'look lantern\'>灯笼</a>随风摇摆，上面写着「饮风客栈」，意思是即使你没有钱，也欢迎来这里聊天听书，喝西北风。西南边有一扇木门，通往客栈后面的马房。',
  objects: {
    // 'npc/waiter': 1,
    // 'npc/innkeeper': 1,
  },
  'valid_entry': 1,
  'no_fight': 1,
  detail: {
    'lantern': '一串纸糊的大灯笼高高地挂在屋前的旗杆上，共是五个，分别写着「饮风客栈」四个大字，最下面的灯笼画着一个葫芦。',
    'desk': '这些桌椅零零散散地放置在客栈的厅中，看来相当老旧了。',
    'curtain': '竹帘用来隔开客人用膳跟厨房的炉灶，但是挡不住从厨房飘出来的香气。',
    'stair': '这道楼梯通往二楼的雅座跟客房。',
    'counter': '柜台后面陈列着一坛坛贴着红纸条的<a cmd=\'look winejar\'>酒缸</a>，这些是客栈掌柜视如性命的陈年老酒，如果你有兴趣，不妨问问掌柜有关这些陈年老酒卖是不卖。',
    'winejar': '你仔细地瞧了瞧酒缸上贴的红纸，不得了，有延德年间的高粱，京城廖麻子酒坊火漆封印的「拔舌酒」，有四季红的「一品醉美人」，还有好几坛贴着「西郊大鼓楼」的陈年老酒。',
  },
  exits: {
    // west: 'inn_kitchen',
    east: 'square_w',
  },
};

var snowSquareWest = {
  short: '广场西',
  long: '这里是雪亭镇广场的西边，广场上铺着整齐的石板。往东可以看见广场中央的大榕树。一家小客栈坐落在西边不远处，客栈前的一串灯笼上写着「饮风客栈」四个大字。',
  exits: {
    west: 'inn_hall',
    east: 'square',
  },
  'no_fight': 1,
  outdoors: 'snow',
};

var snowSquare = {
  short: '广场中央',
  long: '这里是雪亭镇广场的中央，一株巨大的<a cmd="look tree">老榕树</a>盘根错节地站在中央，一些孩童常常<a cmd="climb tree">爬</a>上这棵老榕树嬉戏。榕树下七横八竖地放着几张<a cmd="look bench">长凳</a>供人歇息聊天，树旁还有个水缸供路人取水解渴。',
  objects: {
    // 'item/pot': 1,
    // 'npc/gammer': 1,
    // 'npc/junkman': 1,
  },
  detail: {
    'tree': '这株榕树少说也有两三百岁了，一条条长长的须根几乎垂到地面，树干因为经常被人抚摸而显得光滑。',
    'bench': '十分普通常见的长凳，如果你累了，不必客气，尽管坐下来休息。',
  },
  exits: {
    west: 'square_w',
    // south: 'sqare_s',
    east: 'square_e',
    // north: 'sqare_n',
  },
  actions: {
    climb: 'var me=arguments[0]; var args=arguments[1]; if(args !== "tree") return 0;  me.vision("$N攀着榕树的树干爬了上去。\\n", me); if(me.move("tree")) { me.vision("$N从树下爬了上来。\\n", me); } return 1;',
  },
};

var snowSquareTree = {
  short: '榕树上',
  long: '你现在正在一株巨大的榕树上，茂密的枝叶搔得你有些发痒。前面一根粗大的树枝上，有人放着一块垫子。',
  objects: {
    // 'npc/child': 1,
  },
  exits: {
    down: 'square',
  },
};

var snowSquareEast = {
  short: '广场东',
  long: '这里是雪亭镇广场东边。往东是一条僻静的巷子。西边是一株高大的榕树。南边是一家打铁铺子，不过店门不在这一边。',
  exits: {
    west: 'square',
    east: 'epath',
  },
};

var snowEPath = {
  short: '僻静小巷',
  long: '这里是条僻静的小巷子。往西不远处通往雪亭镇的广场。小巷的北面是一些瓦屋，围绕着高高的<a cmd=\'look wall\'>围墙</a>，看来是有钱人的屋子。南边有家小药铺，门口挂了好些晒干的药草。小巷往东是个转角。',
  exits: {
    west: 'square_e',
    east: 'lane1',
    //south: 'herb_shop',
  },
  detail: {
    'wall': '这里的围墙看起来相当高。不过如果跳起来的话，勉强可以够得着，貌似还可以<a cmd=\'climb wall\'>爬</a>上去。',
  },
  actions: {
    climb: 'var me=arguments[0]; var args=arguments[1]; if(args !== "wall") return 0;  me.vision("$N用手攀上围墙，蹬了几下，翻了过去。\\n", me); if(me.move("kitchen")) { me.vision("$N从围墙的另一头爬了过来。\\n", me); } return 1;',
  },
};

var snowKitchen = {
  short: '厨房',
  long: '你现在正在一户有钱人家的厨房里。不过和你想象中的有钱人家厨房好像不太一样，并没有堆满了鸡鸭鱼肉跟山珍海味，想来有钱人也是省吃俭用才能有钱的。厨房的门在你的南边，不过锁住了。东边则是你进来的<a cmd=\'look wall\'>围墙</a>。',
  detail: {
    'wall': '围墙相当高。不过你既然可以翻墙进来，自然也可以再<a cmd=\'climb wall\'>翻墙</a>回去。',
  },
  actions: {
    climb: 'var me=arguments[0]; var args=arguments[1]; if(args !== "wall") return 0;  me.vision("$N用手攀上围墙，蹬了几下，翻了过去。\\n", me); if(me.move("epath")) { me.vision("$N从围墙的另一头爬了过来。\\n", me); } return 1;',
  },
};

var snowLane1 = {
  short: '僻静小巷',
  long: '这里是条僻静小巷的转角处。小巷往北可以通往溪边，从这里就可以听到溪流哗哗的声音。东边是一栋破旧的大宅院，门口的一块破匾写着「长乐侯府」，不过里面已经是断壁残垣了。小巷南边有一座小土地庙。',
  outdoors: 'snow',
  exits: {
    north: 'lane2',
    west: 'epath',
    east: 'ruin1',
  },
};

var snowLane2 = {
  short: '溪边小路',
  long: '你现在来到一处巷子的入口。往北通往一条溪边的小路。西边是一栋<a cmd=\'look house\'>大瓦房</a>，大门紧锁着。东边有一家<a cmd=\'look mill\'>磨坊</a>，磨坊屋旁友一个<a cmd=\'look wheel\'>水车</a>，正轱辘轱辘地转着。往南通往巷子里的一个转角。',
  detail: {
    'house': '一间高大的瓦房。在雪亭镇这样的山间小镇而言，这样的屋子并不多见，可算得上有钱人家。',
    'wheel': '这家水车是磨坊动力的来源。平常溪水丰沛的季节就直接用水力，一到秋冬枯水季节，就得雇人用脚踩。',
    'mill': '一家用水车碾面粉的磨坊。磨坊的门是关着的，不过从里面传来的声音判断，应该有工人正在里面工作。',
  },
  outdoors: 'snow',
  exits: {
    south: 'lane1',
    north: 'npath3',
  },
};

var snowMill = {
  short: '磨坊',
  long: '这里是一间以磨面粉为业的磨坊。屋子里一大半的空间被一架水车占据。水车转动横过屋梁的木轴，木轴推动几个绞盘转动屋子中央的石磨。屋子的另一角，堆放着一些空的麻袋。',
  exits: {
    out: 'lane2',
  },
  objects: {
    // 'npc/miller': 1,
  },
};

var snowNPath3 = {
  short: '溪边小路',
  long: '你现在来到溪流边上的小路。溪水流过布满石块的河床，发出轰轰的声音。一条木桥跨过溪流往东通往镇外的小路，沿着溪边往南不远处则可以望见一间磨坊。北边一条小路可以下到溪谷中。',
  outdoors: 'snow',
  exits: {
    north: 'river1',
    northwest: 'npath2',
    //east: 'ebridge',
    south: 'lane2',
  },
};

var snowNPath2 = {
  short: '溪边小路',
  long: '这里是一条溪边的小路。从这里可以望见北边的山间一道瀑布从崖上垂下，穿过山坡上的一片树林，以及不远处的草地，往你的东南边流过，溪水冲击着溪床的岩石，发出轰轰的声音。往西沿着小路，可以回到雪亭镇的大街。小路向东南可以通往溪边。',
  outdoors: 'snow',
  exits: {
    //north: '/month/a1',
    southeast: 'npath3',
    west: 'npath1',
  },
  objects: {
    //'npc/woman': 1,
  },
};

var snowNPath1 = {
  short: '小路',
  long: '这里是一条黄土小路。往西可以回到雪亭镇的主要街道。北边是一片草地，草地尽头则是一片树林。往东尼可以听到淙淙的水声，不远处可以望见一条山溪。',
  outdoors: 'snow',
  exits: {
    east: 'npath2',
    //west: 'nstreet2',
  },
};

exports = module.exports = {
  area: '/snow',
  rooms: {
    'inn_hall': snowInnHall,
    'square_w': snowSquareWest,
    'square': snowSquare,
    'tree': snowSquareTree,
    'square_e': snowSquareEast,
    'epath': snowEPath,
    'kitchen': snowKitchen,
    'lane1': snowLane1,
    'lane2': snowLane2,
    'mill': snowMill,
    'npath3': snowNPath3,
    'npath2': snowNPath2,
    'npath1': snowNPath1,
  },
  objects: {
    // 'npc/inn_keeper': _inn_keeper,
    // 'npc/waiter': _waiter,
    // 'npc/gammer': _gammer,
    // 'npc/child': _child,
    // 'npc/junkman': _junkman,
    // 'items/pot': _pot,
  },
};
