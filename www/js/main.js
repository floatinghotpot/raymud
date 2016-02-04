var client = new LoginClient();

function echo(str) {
  var log = $('div#vision-content');
  log.html( log.html() + '<pre>' + str + '</pre>');
}

var saveUserId = 'saveUserId';
var saveUserPasswd = 'saveUserPasswd';

function enterWorld(id) {
  client.rpc('enter', id, function(err, ret){
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
      // $('#messages').empty();
      // $('div#cmds').empty();
      localStorage.setItem(saveUserId, u);
      localStorage.setItem(saveUserPasswd, p);
      echo(ret.token.uid + ' (' + ret.profile.name + ') ' + 'login success');

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

function cmd(str) {
  var log = $('div#chat-log');
  log.html( log.html() + str + '<br/>');
}

function look(what) {
  
}

function go(where) {
  
}

client.on('hello', function(event, args){
  console.log(event, args);
  var log = $('div#vision-content');
  log.html( log.html() + JSON.stringify(args));

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
          echo(('account created: ') + ret.uid + '/' + ret.passwd);
          login(ret.uid, ret.passwd);
        }
      });
    }
  }, 200);
});

client.on('scene', function(event, args){
  document.title = '我的武林' + ' - ' + args.short;

  var title = $('div#scene-title');
  title.html(args.short);

  var content = $('div#scene-content');
  content.html(JSON.stringify(args));
});

client.on('look', function(event, args){
  var log = $('div#scene-content');
  log.html(JSON.stringify(args));
});

client.on('vision', function(event, args){
  var log = $('div#vision-content');
  log.html( log.html() + '<pre>' + args + '</pre>' + '<br/>');
});

client.on('feedback', function(event, args){
  var log = $('div#vision-content');
  log.html( log.html() + '<pre>' + args + '</pre>' + '<br/>');
});

client.on('chat', function(event, args){
  var log = $('div#chat-log');
  log.html( log.html() + JSON.stringify(args) + '<br/>');
});

var homePage = 'scene';
var activePage = 'scene';

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
      cmd($('input#chat-box').val());
      $('input#chat-box').val('');
    }
  });

  showPage(homePage);
  setTimeout(function(){
    adjustPages();
  }, 100);

  client.bind(io(), true);
});
