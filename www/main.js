var client = new LoginClient();

var gameInfo = {};

var saveUserId = 'saveUserId';
var saveUserPasswd = 'saveUserPasswd';

var curScene = {};

$.cookie('lang', 'zh');
hotjs.i18n.setLang('zh');
hotjs.i18n.translate();

function enterWorld(id) {
  client.rpc('enter', id, function(err, ret){
    if(!err) echo('你穿越进入虚拟世界。\n');
  });
}

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
    if(what[0] !== '/') {
      echo('这里没有这样东西。\n');
      return;
    }
  }
  
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
  if(typeof str !== 'string') return;
  str = str.replace(/\n/g, '<br/>').replace(/<a cmd=/g, '<a href=\'#\' class=\'cmd\' cmd=');
  console.log(str);
  return str;
}

function title(str) {
  document.title = '『武林新传』' + ' - ' + str;
  $('div#scene-title').html(str);
  $('div#vision-title').html(str);
}

function echo(str) {
  var t = $('div#vision-content');
  var p = $('<p>').append(parseStr(str));
  t.append(p);
  t.scrollTop(t.prop("scrollHeight"));

  //setTimeout(function(){
  //  t.animate({ scrollTop: t.prop("scrollHeight") }, 500);
  //}, 50);

  $('a.cmd', p).on('click', onCmdLinkClicked);
}

function scene(str) {
  var t = $('div#scene-content');
  t.html(parseStr(str));

  // when go out of room, remove the command link and space
  $('div#vision-content').find('a').contents().unwrap();
  $('li', 'div#vision-content').removeClass('exit');

  // display it in vision log view
  echo(str);
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

//var cmdcontainer = 'div#cmds';
//var dlgcontainer = 'body';

var cmdcontainer = 'div#cmds';
var dlgcontainer = 'div#vision-content';

function parseReply(err, ret) {
  if(err) echo(ret);
  else if(typeof ret === 'string') echo(ret);
  else if(ret.cmds) updateCmds('reply', ret);
}

function login(u, p) {
  localStorage.setItem(saveUserId, u);
  localStorage.setItem(saveUserPasswd, p);

  client.rpc('login', {
    uid: u,
    passwd: p
  }, parseLoginReply);
}

function parseSignUpReply(err, ret){
  parseReply(err, ret);
  if(! err) {
    echo('帐号已创建：' + ret.uid + ' / ' + ret.passwd);
    login(ret.uid, ret.passwd);
  }
}

function parseLoginReply(err,ret){
  parseReply(err, ret);
  if(err) {
    localStorage.removeItem(saveUserId);
    localStorage.removeItem(saveUserPasswd);
    echo(ret);
  } else {
    echo('登录成功。\n');

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
}

function onBtnClicked(e) {
  var method = $(this).attr('id');
  switch(method) {
  case 'fastsignup':
    client.rpc(method, $(this).attr('arg'), parseSignUpReply);
    break;
  default:
    client.rpc(method, $(this).attr('arg'), parseReply);
  }
  $('div#cmds').remove();
}

function onInputBtnClicked(e){
  var method = $(this).attr('id');
  client.rpc(method, $('input#'+method).val(), parseReply);
  $('input#'+method).val('');
  $('div#cmds').remove();
}

function onInputBoxEnter(e) {
  if(e.which == 13) onInputBtnClicked.call(this, e);
}

function onDialogBtnClicked(e) {
  var t = $('div#vision-content');

  var method = $(this).attr('id');
  var dlg = $('div#'+method);
  dlg.appendTo(dlgcontainer);
  dlg.show();

  var t = $('div#vision-content');
  t.scrollTop(t.prop("scrollHeight"));

//  var x = ($(window).width() - dlg.width()) / 2;
//  var y = ($(window).height() - dlg.height()) / 2;
//  dlg.css({
//    position:'absolute',
//    left: x + 'px',
//    top: y + 'px',
//  });

  $('div#cmds').hide();
//  $(this).hide();
}

function onDialogXClicked(e) {
  var method = $(this).attr('X');
  $('div#'+method).hide();
  $('div#cmds').show();
  //$('button#'+method).show();
}

function onDialogOKClicked(e) {
  var method = $(this).attr('OK');
  var args = {};
  $('input.' + method).each(function(i, v){
    var input = $(this);
    args[ input.attr('id') ] = input.val();
  });
  switch(method) {
  case 'signup':
    client.rpc(method, args, parseSignUpReply);
    break;
  case 'login':
    client.rpc(method, args, parseLoginReply);
    break;
  default:
    client.rpc(method, args, parseReply);
  }
}

function updateCmds(event, ret){
  $('div#cmds').remove();
  $('<div>').attr('id', 'cmds').appendTo('div#vision-content');

  var tips = ret.tips;
  if(typeof tips === 'string') {
    $('<p>').text(_T(tips)).appendTo('div#cmds');
  }

  var cmds = ret.cmds;

  var v, div, btn, words, label, input;
  for(var k in cmds) {
    v = cmds[ k ];
    if(v === null) {
      $('div#'+k).remove();
      $('button#'+k).remove();

    } else if(v === true) {
      if(k === 'fastsignup') {
        var u = localStorage.getItem(saveUserId);
        var p = localStorage.getItem(saveUserPasswd);
        //if(u && p) continue;
      }

      btn = $('<button>').text(_T(k)).attr('id', k).attr('arg', 0).addClass('cmd');
      $(cmdcontainer).append(btn);
      btn.on('click', onBtnClicked);

    } else if(typeof v === 'string') {
      div = $('<div>').attr('id',k).addClass('cmd');
      $(cmdcontainer).append(div);
      input = $('<input>').attr('id', k).addClass('cmd');
      words = v.split(',');
      switch(words[0]) {
      case 'range':
        input.attr('type', 'range');
        if(words[1]) {
          var min = parseInt(words[1]);
          input.attr('min', min).val(min);
        }
        if(words[2]) input.attr('max', parseInt(words[2]));
        break;
      case 'number':
        input.attr('type', 'number').attr('size',5);
        if(words[1]) input.attr('min', parseInt(words[1], 10));
        if(words[2]) input.attr('max', parseInt(words[2], 10));
        break;
      case 'password':
        input.attr('type', 'password').attr('size',40);
        break;
      //case 'text':
      default:
        input.attr('type', 'text').attr('size',40);
        break;
      }
      div.append(input);
      btn = $('<button>').text(_T(k)).attr('id', k).addClass('cmd');
      div.append(btn);
      btn.on('click', onInputBtnClicked);
      input.keydown(onInputBoxEnter);

    } else if(Array.isArray(v)) {
      div = $('<div>').attr('id',k).addClass('cmd');
      $('#cmds').append(div);
      for(var i=0; i<v.length; i++) {
        var arg = v[i];
        var t_arg = (typeof arg === 'string') ? _T(arg) : arg;
        btn = $('<button>').text(t_arg).attr('id', k).attr('arg', arg).addClass('cmd');
        div.append(btn);
        btn.on('click', onBtnClicked);
      }

    } else if( typeof v === 'object' ) {
      btn = $('<button>').text(_T(k)).attr('id', k).addClass('cmd');
      $(cmdcontainer).append(btn);

      var dlg = $('<div>').attr('id',k).addClass('dialog');
      $(dlgcontainer).append(dlg);
      dlg.hide();

      var dlgheader = $('<div>').addClass('dlgheader');
      dlg.append(dlgheader);
      dlgheader.append($('<span>').text(_T(k)));

      var dlgbody = $('<div>').addClass('dlgbody');
      dlg.append(dlgbody);
      for(var j in v) {
        label = $('<div>').addClass('label');
        label.append($('<label>').attr('for', j).text(_T(j)+':').addClass('cmd'));
        input = $('<input>').attr('id', j).addClass(k).addClass('cmd');

        words = v[j].split(',');
        switch(words[0]) {
        case 'range':
          input.attr('type', 'range');
          if(words[1]) input.attr('min', parseInt(words[1], 10));
          if(words[2]) input.attr('max', parseInt(words[2], 10));
          break;
        case 'number':
          input.attr('type', 'number').attr('size',5);
          if(words[1]) input.attr('min', parseInt(words[1], 10));
          if(words[2]) input.attr('max', parseInt(words[2], 10));
          break;
        case 'password':
          input.attr('type', 'password').attr('size',40);
          break;
        //case 'text':
        default:
          input.attr('type', 'text').attr('size',40);
          break;
        }

        switch(j) { // auto fill if we remember uid & passwd
        case 'uid':
          var u = localStorage.getItem(saveUserId);
          if(u) input.val(u);
          break;
        case 'passwd':
          var p = localStorage.getItem(saveUserPasswd);
          if(p) input.val(p);
          break;
        }

        dlgbody.append(label).append(input).append('<br/>');
      }
      var dlgfooter = $('<div>').addClass('dlgfooter');
      dlg.append(dlgfooter);
      var OK = $('<button>').text(_T('OK')).attr('OK', k).addClass('cmd');
      var X = $('<button>').text(_T('Cancel')).attr('X', k).addClass('cmd');
      dlgfooter.append(OK);
      dlgfooter.append(X);

      btn.dlg = dlg;
      btn.on('click', onDialogBtnClicked);
      OK.on('click', onDialogOKClicked);
      X.on('click', onDialogXClicked);

      if(_.size(cmds) === 1 && btn) btn.trigger('click');
    } else {

    }
  }

  var t = $('div#vision-content');
  t.scrollTop(t.prop("scrollHeight"));
}

client.on('hello', function(event, args){
  $('div#vision-content').html('');
  echo(args.hello_msg);
  echo('版本号：' + args.version);

//  setTimeout(function(){
//    var u = localStorage.getItem(saveUserId);
//    var p = localStorage.getItem(saveUserPasswd);
//    console.log(u, p);
//    if(u && p) {
//      login(u, p);
//    } else {
//      //socket.emit('hello', {});
//      client.rpc('fastsignup', 0, function(err, ret){
//        console.log(err, ret);
//        if(err) {
//          echo(err);
//        } else {
//          echo(('您是第一次访问，自动创建账号：') + ret.uid + ' / ' + ret.passwd);
//          login(ret.uid, ret.passwd);
//        }
//      });
//    }
//  }, 200);
});

client.on('prompt', updateCmds);

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
  curScene = args;
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
    str += '这里明显的出口有：\n';
    var items = [];
    for(var i in exits) {
      var room = exits[i];
      items.push('<li class=\'exit\'>□ <a cmd=\'go ' + i + '\'>' + (_dirs[i] || i) + '</a>（' + room + '）</li>');
    }
    str += '<ul>' + (items.join('')) + '</ul>';
  }
  scene(str);
});

client.on('look', function(event, args){
  echo(args.long);
  //scene(args);
});

client.on('vision', function(event, args){
  echo(args);
});

client.on('feedback', function(event, args){
  echo(args);
});

client.on('fail', function(event, args){
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
