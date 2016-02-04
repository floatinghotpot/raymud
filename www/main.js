var client = new LoginClient();

var saveUserId = 'saveUserId';
var saveUserPasswd = 'saveUserPasswd';

function enterWorld(id) {
  client.rpc('enter', id, function(err, ret){
    if(!err) echo('你连线进入虚拟世界。\n');
  });
}

function login(u, p) {
  client.rpc('login', {
    uid: u,
    passwd: p
  }, function(err,ret){
    if(err) {
      localStorage.removeItem(saveUserId);
      localStorage.removeItem(saveUserPasswd);
      echo(ret);
    } else {
      echo('自动登录成功。\n');

      localStorage.setItem(saveUserId, u);
      localStorage.setItem(saveUserPasswd, p);
      //echo(ret.token.uid + ' (' + ret.profile.name + ') ' + 'login success');

      client.rpc('worlds', 0, function(err, ret) {
        if(!err) {
          if(Array.isArray(ret) && ret.length>0) {
            for(var i=0; i<ret.length; i++) {
              if(ret[i] && ret[i].id) {
                enterWorld(ret[i].id);
              }
            }
          } else echo(JSON.stringify(ret));
        } else echo(err);
      });
    }
  });
}

var curScene = {};

function runCmd(str) {
  if(str.indexOf('look ') === 0) {
    var what = str.split(' ')[1];
    if(curScene && curScene.detail) {
      var whatLooks = curScene.detail[what];
      if(whatLooks) {
        echo(whatLooks + '\n');
        return;
      }
    }
  }
  
  // TODO: send to server
  client.rpc('cmd', str, function(err, ret) {
    if(ret) echo(ret + '\n');
  });
}

function onCmdLinkClicked(e) {
  var a = e.target;
  var cmd = $(a).attr('cmd');
  runCmd(cmd);
}

function parseStr(str) {
  str = str.replace(/\n/g, '<br/>').replace(/<a cmd=/g, '<a href=\'#\' class=\'cmd\' cmd=');
  console.log(str);
  return str;
}

function title(str) {
  document.title = '『我的武林』' + ' - ' + str;
  $('div#scene-title').html(str);
}

function echo(str) {
  var t = $('div#vision-content');
  t.html(t.html() + parseStr(str) + '<br/>');
  $('a.cmd').on('click', onCmdLinkClicked);
  setTimeout(function(){
    t.animate({ scrollTop: t.prop("scrollHeight") }, 500);
  }, 50);
}

function scene(args) {
  curScene = args;

  var t = $('div#scene-content');
  t.html(JSON.stringify(args));
}

function chat(args) {
  var str = '';
  if(typeof args === 'str') 
    str = args;
  else if(typeof args === 'object')
    str = args.short + ': ' + args.str + '<br/>';

  var t = $('div#chat-logs');
  t.html(t.html() + str + '<br/>');
  setTimeout(function(){
    t.animate({ scrollTop: t.prop("scrollHeight") }, 1000);
  }, 50);
}

function bag(args) {
  var t = $('div#bag-content');
  t.html(JSON.stringify(args));
}

function me(args) {
  var t = $('div#me-content');
  t.html(JSON.stringify(args));
}

client.on('hello', function(event, args){
  echo(args.hello_msg + '\n版本号：' + args.version +'\n');

  setTimeout(function(){
    var u = localStorage.getItem(saveUserId);
    var p = localStorage.getItem(saveUserPasswd);
    console.log(u, p);
    if(u && p) {
      login(u, p);
    } else {
      //socket.emit('hello', {});
      client.rpc('fastsignup', 0, function(err, ret){
        console.log(err, ret);
        if(err) {
          echo(err);
        } else {
          echo(('自动创建了账号：') + ret.uid + '/' + ret.passwd);
          login(ret.uid, ret.passwd);
        }
      });
    }
  }, 200);
});

var _dirs = {
  east: '东',
  west: '西',
  south: '南',
  north: '北',
  'southeast': '东南',
  'northeast': '东北',
  'southwest': '西南',
  'northwest': '西北',
  'up': '上',
  'down': '下',
  'out': '外面',
};

client.on('scene', function(event, args){
  title(args.short);
  
  var str = args.long + '\n';

  var objs = args.objects;
  if(objs && _.size(objs)>0) {
    str += '你看见：';
    var items = [];
    for(var key in objs) {
      var obj = objs[key];
      items.push('<a cmd=\'look ' + key + '\'>' + obj + '</a>');
    }
    str += (items.join('、')) + '。\n';
  }

  var exits = args.exits;
  if(exits && _.size(exits)>0) {
    str += '这里明显的出口有：';
    var items = [];
    for(var i in exits) {
      var room = exits[i];
      items.push('<a cmd=\'go ' + i + '\'>' + (_dirs[i] || i) + '</a>（' + room + '）');
    }
    str += (items.join('、')) + '。\n';
  }
  echo(str);
  scene(args);
});

client.on('look', function(event, args){
  echo(args.long);
  scene(args);
});

client.on('vision', function(event, args){
  echo(args);
});

client.on('feedback', function(event, args){
  echo(args);
});

client.on('chat', function(event, args){
  chat(args);
});

var homePage = 'vision';
var activePage = 'vision';

function adjustPageLayout(pageid, h) {
  var compactMode = $(window).width() <= 800;
  // resize content size
  var page = $('div#'+pageid+'-page');
  var title = $('div#'+pageid+'-title');
  var content = $('div#'+pageid+'-content');
  var offset = compactMode ? $('div#navbar').outerHeight(true) : 0;
  content.css({
    height: page.height()-title.outerHeight()-offset,
  });
}

function adjustChatPageLayout() {
  var chatcontent = $('div#chat-content');
  var chatlog = $('div#chat-log');
  var chatinput = $('div#chat-input');
  var chatbox = $('input#chat-box');
  var chatsmiley = $('button#chat-smiley');

  var compactMode = $(window).width() <= 800;
  chatinput.css({
    width: chatcontent.width(),
    bottom: compactMode ? $('div#navbar').outerHeight() : 0,
  });
  chatbox.css({
    width: chatinput.width() -chatsmiley.outerWidth(true) -12,
  });
  chatlog.css({
    height: chatcontent.height()-chatinput.outerHeight(true),
  });
}

function adjustPages() {
  var compactMode = $(window).width() <= 800;
  if(compactMode) {
    adjustPageLayout(activePage, $('div#navbar').outerHeight());
    if(activePage === 'chat') adjustChatPageLayout();
  } else {
    ['scene', 'vision', 'chat', 'bag', 'me'].forEach(function(pageid){
      adjustPageLayout(pageid, 0);
    });
    adjustChatPageLayout();
  }
}

function showPage(pageid) {
  if(pageid) activePage = pageid;
  var compactMode = $(window).width() <= 800;
  var navbar = $('div#navbar');
  if(compactMode) {
    // hide all pages
    $('div.pageview').hide();
    $('button.navbtn').removeClass('current');

    // show only current page
    $('div#'+activePage+'-page').show();
    $('button#'+activePage).addClass('current');

    adjustPageLayout(activePage, $('div#navbar').outerHeight());
    adjustChatPageLayout();

  } else {
    $('div.pageview').show();
  }
}

$(window).resize(function (){
  showPage(activePage);
  adjustPages();
});

$(document).ready(function(){
  $('button.navbtn').on('click', function(e) {
    var pageid = $(this).attr('id');
    showPage(pageid);
  });

  $('input#chat-box').keydown(function(e){
    var keycode = e.which;
    if(keycode === 13) {
      chat($('input#chat-box').val());
      $('input#chat-box').val('');
      $('button#chat-smiley').focus();
    }
  });

  showPage(homePage);
  setTimeout(function(){
    adjustPages();
  }, 100);

  client.bind(io(), true);
});
