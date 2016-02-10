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
    north: 'inn_kitchen',
    east: 'square_w',
  },
};

var snowInnKitchen = {
  short: '厨房',
  long: '这里是一间宽敞的厨房，一座<a cmd=\'look owen\'>大灶</a>占据了东边半个墙壁。南边的<a cmd=\'look cabinet\'>柜子</a>整整齐齐地放着许多锅碗瓢盆。这里平常是相当忙碌的，如果你要在这里东张西望的话，最好别被店小二端着的热汤给烫到了。往东可以回到客栈里。',
  detail: {
    'cabinet': '这些柜子里放的是给客人用的碗盘碟筷，分门别类装在几个大柜子里。柜子的门都拆了，想是方便取用。',
    'owen': '一座燃烧着熊熊炭火的大灶，灶口可以容纳一个汉子<a cmd=\'climb owen\'>爬</a>进去。不过白天炭火烧得正热，当然不会有人干这种傻事。',
  },
  exits: {
    south: 'inn_hall',
  },
  actions: {
    climb: 'var me=arguments[0]; var args=arguments[1]; if(args !== "owen") return 0;  me.vision("$N一矮身，从大灶的灶口钻了进去。\\n", me); if(me.move("fireplace")) { me.vision("$N从外面钻了进来，跟你挤成一团。\\n", me); } return 1;',
  },
};

var snowFirePlace = {
  short: '大灶内',
  long: '你现在正蜷缩着挤在一个大灶之中。头顶上方隐隐可以看到烟囱的出口，不过显然没有办法爬出去。这里的墙壁因为常年烧火而变得乌黑，地面上积着一层厚厚的柴灰。',
  exits: {
    out: 'inn_kitchen',
  },
  objects: {
    //'item/woodsword': 1,
    //'item/woodblade': 1,
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
    east: 'square_e',
    south: 'square_s',
    north: 'square_n',
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

var snowSquareNorth = {
  short: '广场北',
  long: '这里是雪亭镇广场北边，平常是附近孩童嬉戏游玩的地方，初一十五则是市集的所在。往南可以看见一株大榕树，往北则是一条笔直的街道。',
  exits: {
    north: 'nstreet1',
    south: 'square',
  },
  outdoors: 'snow',
  objects: {
    //'npc/child1': 1,
    //'npc/child2': 1,
  },
};

var snowSquareSouth = {
  short: '广场南',
  long: '这里是雪亭镇广场的南边，往北可以望见一株高大的榕树，广场以榕树为中心形成一个十多丈见方的大空地。街道往南通往镇外。东边不远处有间打铁铺子。',
  exits: {
    north: 'square',
    south: 'sstreet1',
    east: 'smithy',
    west: 'square_sw',
  },
  outdoors: 'snow',
};

var snowSquareSouthWest = {
  short: '广场西南',
  long: '这里是雪亭镇广场的西南边，广场中央的大榕树就在你的东北方不远处。这里的北边可以看见一家客栈。往西是一条街道，东边穿过一个路口可以看见一家打铁铺子。',
  exits: {
    north: 'square_w',
    east: 'square_s',
    west: 'wstreet1',
  },
  outdoors: 'snow',
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
    south: 'herb_shop',
  },
  detail: {
    'wall': '这里的围墙看起来相当高。不过如果跳起来的话，勉强可以够得着，貌似还可以<a cmd=\'climb wall\'>爬</a>上去。',
  },
  actions: {
    climb: 'var me=arguments[0]; var args=arguments[1]; if(args !== "wall") return 0;  me.vision("$N用手攀上围墙，蹬了几下，翻了过去。\\n", me); if(me.move("kitchen")) { me.vision("$N从围墙的另一头爬了过来。\\n", me); } return 1;',
  },
};

var snowHerbShop = {
  short: '小药铺',
  long: '这里是一间小药铺，连像样一点的招牌都没有，只在门边挂着一块不甚起眼的木牌，上面写着［顺生堂］三个字。老旧的柜台后面陈列着一列药柜，药柜的每个抽屉按药铺的规矩都没有任何标签。西面的墙上吊着几束晒干的甘草。像这种小药铺没有钱烧檀香祛除药味，只好用甘草替代。',
  exits: {
    north: 'epath',
  },
  objects: {
    //'npc/herbalist': 1,
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

var snowRuin1 = {
  short: '破旧大宅',
  long: '这里是一间破旧大宅的前院，大厅已经崩塌了一半，焦黑的<a cmd=\'look pole\'>梁柱</a>挡住了你的去路。庭院里<a cmd=\'look grass\'>杂草</a>丛生，看来已经很久没人住了。据说这里晚上有鬼魂出现，但是倒也从没有听说过有人被害，因此附近的居民仍然照常生活。往西可以经由大宅的正门回到街上。',
  detail: {
    'grass': '这里的杂草已经足足有及腰的长度了，你忽然发现南边的草丛有什么东西发出金属的闪光，不过也可能是你的错觉。或许可以<a cmd=\'search grass\'>找找看</a>。',
    'pole': '从梁柱焦黑的痕迹来看，这座大宅的主人大概是因为火灾的关系才离开的吧。貌似沿着这个梁柱，可以<a cmd=\'climb pole\'>爬</a>到里面去。',
  },
  actions: {
    climb: 'var me=arguments[0]; var args=arguments[1]; if(args !== "pole") return 0;  me.vision("$N小心翼翼地爬过坍塌的梁柱进入大厅。\\n", me); if(me.move("ruin2")) { me.vision("$N从坍塌梁柱的另一头爬了过来。\\n", me); } return 1;',
    search: 'var me=arguments[0]; var args=arguments[1]; if(args !== "grass") return 0;  if(this.flag) me.vision("$N在杂草里找来找去，但是什么也没有找到。\\n", me); return 1; this.flag=1; var ob = this._world.cloneObject("/snow/item/hairpin"); ob.move(me); me.vision("$N在草丛里找来找去，结果发现一支发簪！\\n", me); return 1;',
  },
  exits: {
    west: 'lane1',
  },
};

var snowRuin2 = {
  short: '破旧大宅正厅',
  long: '这里是一间破旧大宅的正厅，北面的墙壁跟屋顶已经整个坍塌了，凉飕飕的冷风从北边的<a cmd=\'look gap\'>缺口</a>直灌进来。令你觉得意外的是，这里清扫得相当整洁。地上用干草整整齐齐地铺着一个<a cmd=\'look bed\'>床铺</a>。说是流浪汉在这里栖宿却也不像，哪里会有这么爱整洁的流浪汉？大厅倒塌的<a cmd=\'look pole\'>梁柱</a>挡住了往西的出口。',
  detail: {
    'pole': '一根粗大的梁柱倒了下来，正好挡住了正亭的出口。沿着这个梁柱，可以<a cmd=\'climb pole\'>爬</a>到外面去。',
    'bed': '一个用干草铺成的床铺，虽然简陋，但是却干干净净。当你靠近的时候，竟还闻到一股淡淡的脂粉香气。',
    'gap': '从缺口往外望去，只见大宅的其他部分都已经成为瓦砾堆了。如果你想过去，勉强可以从缺口爬出去。',
  },
  actions: {
    climb: 'var me=arguments[0]; var args=arguments[1]; if(args !== "pole") return 0;  me.vision("$N爬过倒塌的梁柱，往大宅的前院离去。\\n", me); if(me.move("ruin1")) { me.vision("$N从坍塌梁柱的另一头爬了出来。\\n", me); } return 1;',
  },
  exits: {
    north: 'riverbank',
  },
  objects: {
    //'npc/girl': 1,
  },
};

var snowRiverBank = {
  short: '河边空地',
  long: '这里是河边的一处空地。湍急的河流从你的北边往东南边流去。离这里的河岸往北一丈多远的地方可以看见一个水车。南边则是一间破旧的大宅院，墙壁上一个大缺口足足可以让人通过。',
  outdoors: 'snow',
  exits: {
    south: 'ruin2',
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
    east: 'ebridge',
    south: 'lane2',
  },
};

var snowEBridge = {
  short: '木桥',
  long: '你现在来到一条横过山溪的桥上。山溪虽不甚宽，但是深度却有三、四丈，因此这条桥对雪亭镇对外的交通格外重要。桥下的溪水正发出轰隆轰隆的巨响流过溪谷。往西是雪亭镇，往东则通往著名的雪吟山庄，威震武林的武林盟主于兰兼毅现在正驻足在庄上。',
  'no_clean_up': 0,
  outdoors: 'snow',
  exits: {
    west: 'npath3',
    //east: '/snowkeep/entrance',
  },
  objects: {
    //'npc/guard': 2,
  },
};

var snowRiver1 = {
  short: '溪边',
  long: '这里是溪流旁的乱石滩，溪流两岸都有一丈多高，只有此处因为溪流弯道冲击，形成一处小石滩。水流冲击的声音经过溪谷的回音整耳欲聋，往南一条小路可以回到岸边。',
  outdoors: 'snow',
  resource: {
    'water': 1,
  },
  exits: {
    //north: '/chixiao/river2',
    south: 'npath3',
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
    west: 'nstreet2',
  },
};

var snowNStreet2 = {
  short: '街道',
  long: '这这里是雪亭镇北边的主要街道，往南稍远处便是一处广场。往北可见一条蜿蜒的山路穿过长满芒草的山坡通往野羊山上。东边是一条小路通往溪边，西边则是一间驿站。',
  outdoors: 'snow',
  objects: {
    //'/obj/area/man': 1,
  },
  exits: {
    east: 'npath1',
    //west: 'post_office',
    north: 'ngate',
    south: 'nstreet1',
  },
};

var snowNGate = {
  short: '山路',
  long: '你现在正走在一条蜿蜒的山路上。往南不远处可以看见许多人家和房舍，往北则通往山上。山路两旁长满杂草。靠西的一面是山壁，东边是平缓的山坡，山坡尽头是一片草地。',
  outdoors: 'snow',
  'connect-p': 1,
  exits: {
    south: 'nstreet2',
    // north: '/goat/sroad1',
  },
  objects: {
    //'npc/garrison': 4,
    //'npc/lieutenant': 1,
  },
};

var snowNStreet1 = {
  short: '街道',
  long: '这这里是雪亭镇北边的主要街道，往南通往镇上最热闹的广场。往北则通往镇北的山路。你的两边都是一些卖杂货的<a cmd=\'look store\'>店铺</a>。这一代除了市集的日子，并补常有人走动。',
  outdoors: 'snow',
  detail: {
    'store': '各式各样的店铺都有，不过看起来不像是你会用得着的地方。',
  },
  exits: {
    north: 'nstreet2',
    south: 'square_n',
  },
};

var snowWStreet1 = {
  short: '街道',
  long: '这里是雪亭镇广场西边的街道。往北是一间客栈。不过这个方向没有入口。南边一间青瓦房，门口洒扫得干干净净，似是一家私塾模样。往西的街道十分宽敞，路上还有车马经过压出的沟痕。',
  outdoors: 'snow',
  exits: {
    south: 'school',
    east: 'square_sw',
    west: 'wstreet2',
  },
};

var snowSchool = {
  short: '私塾',
  long: '这里是一间私塾，简单的陈设与几张排得整整齐齐的桌椅，就是这间屋子的所有家具。屋角一个大书橱，里面放着许多手抄本的古书，不过书柜的门是锁着的。最前面的桌上放着文房四宝，与一盆小巧的盆栽柏树。私塾的出口在北边。',
  'no_fight': 1,
  exits: {
    north: 'wstreet1',
  },
  objects: {
    //'npc/teacher': 1,
    //'npc/alchemist': 1,
    //'npc/child3': 2,
  },
};

var snowCourt = {
  short: '乡校',
  long: '这里是雪亭镇的乡校，平常镇民对官府的施政有什么不满的可以到这里来向校老申诉。所谓的校老，就是地方上有德行与声望的老人。今年担任校老的是开磨坊的杨老爹。但是他最近身体不是很好，并不常到乡校里来。往南是街道，北边是一间衙堂，当县里派师爷来这里断事就会在那里开堂。',
  outdoors: 'snow',
  exits: {
    south: 'wstreet2',
  },
  objects: {
    //'npc/oldman': 1,
  },
};

var snowWStreet2 = {
  short: '街道',
  long: '这里是雪亭镇广场西边的街道。北边是雪亭镇的乡校，平常会有些镇上的长者在这里谈论镇上的闲事。县里若有公爷来这里断事，也是在这里设的公堂。往西不远处就是出镇的官道。街道南边是一家糕饼铺。',
  outdoors: 'snow',
  exits: {
    north: 'court',
    east: 'wsteet1',
    west: 'wgate',
  },
};

var snowWGate = {
  short: '雪亭镇',
  long: '这里是雪亭镇西边的官道。虽然雪亭驿设在镇上的北边，但是官道却是从西边入雪亭。因为原来修官道时利用了一段从前中阳侯征平乱军的栈道，因此这条官道便从西边穿过山谷接古阳栈道，出黄石隘。往东通往雪亭镇的街道，往西则出镇。',
  outdoors: 'snow',
  exits: {
    east: 'wstreet2',
    //northwest: '/graveyard/grave1',
  },
};

var snowSmithy = {
  short: '打铁铺子',
  long: '这里是一间打铁铺子。墙上挂着许多<a cmd=\'look steel\'>铁器</a>的半成品跟工具。铺子中间一个烧着熊熊火焰的火炉映得你的影子一晃一晃的。旁边还有一个沉重的<a cmd=\'look anvil\'>大铁砧</a>。铺子的出口就在西边。',
  outdoors: 'snow',
  detail: {
    'anvil': '这个大铁砧看起来十分沉重，上面满是敲打的痕迹。',
    'steel': '这些铁器有锅子、铲子、铁锤、耕田用的锄头、犁头等等。',
  },
  exits: {
    west: 'square_s',
  },
  objects: {
    //'npc/smith': 1,
  },
};

var snowSStreet1 = {
  short: '街道',
  long: '这里是雪亭镇南边连接镇外的街道。西边有一间货栈，东边则是一家杂货铺。街道往北通往广场南边，往南传过一个草棚出镇外。',
  outdoors: 'snow',
  exits: {
    south: 'sgate',
    east: 'bazar',
    west: 'store',
    north: 'square_s',
  },
};

var snowSGate = {
  short: '草棚',
  long: '这里是雪亭镇南边的入口，往北穿过草棚通往雪亭镇的街道。出草棚往镇外有两条路，往东南的路穿过雪亭南方的老松林，通往县城乔阴，这条路虽然比较近，但是近来一群自称老松寨的土匪常常在这一带出没。往西的一条烟者老松林外的大路通往临近的五堂镇。从乔阴县城往天邪国的商旅，现在大多绕道走着一条路，因为往五堂镇的路上有一处北军府训练新兵的军营，常有军士巡逻，拦路强人多半不敢滋事。',
  outdoors: 'snow',
  exits: {
    north: 'sstreet1',
    //southeast: '/oldpine/road1',
    //west: '/newcamp/gate',
  },
};

var snowStore = {
  short: '货栈',
  long: '这里是一间货栈，也是旅行客商们存放货物、运送、转交的地方。雪亭镇因为位于通往天邪国的重要道路，所以货栈往来的货物相当的多，因此成为少数几个设有货栈的村镇。天朝各地的货栈大多数互相联系，因此商业十分发达，忙碌的货栈也常常是缺钱的人打临工的地方。因为货栈的工作量不固定，有大批货物进来的时候往往需要平常十几倍的人手，但是货栈的利润又雇不起长期的工人。',
  'no_fight': 1,
  exits: {
    east: 'sstreet1',
  },
  objects: {
    //'npc/foreman': 1,
    //'item/wagon': 1,
    //'item/crate': 3,
  },
};

var snowHazar = {
  short: '鱼记小铺',
  long: '这里是一间小店铺。右侧摆了个长架，不甚起眼的几件日常用品零零落落地摆在架上。你看到了有瓶罐、棉被、碗盘竹筷蹬杂物，不过上面隐隐有些灰尘黄土，似乎这儿老板不常清扫。正厅有个大圆桌，上面摆了些布匹服饰。左侧有个高大的柜台，上面挂了个<a cmd=\'look label\'>匾额</a>，看来像是个小钱庄。',
  detail: {
    'label': '［ 小 鱼 吃 四 海\n 金 银 文 都 来 ］\n',
    'counter': '一座漆黑红杉所锯雕而成，散发出一种浓郁的杉木味，看来价值不菲。\n',
  },
  exits: {
    west: 'sstreet1',
  },
  objects: {
    //'npc/yu': 1,
  },
};

exports = module.exports = {
  area: '/snow',
  rooms: {
    'inn_hall': snowInnHall,
    'inn_kitchen': snowInnKitchen,
    'fireplace': snowFirePlace,
    'square_w': snowSquareWest,
    'square': snowSquare,
    'tree': snowSquareTree,
    'square_e': snowSquareEast,
    'square_s': snowSquareSouth,
    'square_n': snowSquareNorth,
    'square_sw': snowSquareSouthWest,
    'epath': snowEPath,
    'herbshop': snowHerbShop,
    'kitchen': snowKitchen,
    'lane1': snowLane1,
    'lane2': snowLane2,
    'ruin1': snowRuin1,
    'ruin2': snowRuin2,
    'riverbank': snowRiverBank,
    'mill': snowMill,
    'npath3': snowNPath3,
    'ebridge': snowEBridge,
    'river1': snowRiver1,
    'npath2': snowNPath2,
    'npath1': snowNPath1,
    'nstreet1': snowNStreet1,
    'nstreet2': snowNStreet2,
    'ngate': snowNGate,
    'wstreet1': snowWStreet1,
    'wstreet2': snowWStreet2,
    'school': snowSchool,
    'court': snowCourt,
    'wgate': snowWGate,
    'sstreet1': snowSStreet1,
    'sgate': snowSGate,
    'smithy': snowSmithy,
    'store': snowStore,
    'hazar': snowHazar,
  },
  npc: {
    // 'inn_keeper': _inn_keeper,
    // 'waiter': _waiter,
    // 'gammer': _gammer,
    // 'child': _child,
    // 'junkman': _junkman,
    // 'yu': _yu,
    // 'foreman': _foreman,
  },
  item: {
    // 'woodsword': _woodsword,
    // 'woodblade': _woodblade,
    // 'pot': _pot,
    // 'wagon': _wagon,
    // 'crate': _crate,
  },
};
