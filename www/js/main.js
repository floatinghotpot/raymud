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
  var log = $('div#scene-content');
  log.html(JSON.stringify(args));
});

client.on('look', function(event, args){
  var log = $('div#scene-content');
  log.html(JSON.stringify(args));
});

client.on('vision', function(event, args){
  var log = $('div#vision-content');
  log.html( log.html() + '<pre>' + args + '</pre>');
});

client.on('feedback', function(event, args){
  var log = $('div#vision-content');
  log.html( log.html() + '<pre>' + args + '</pre>');
});

client.on('chat', function(event, args){
  var log = $('div#chat-content');
  log.html( log.html() + '<br/>' + JSON.stringify(args));
});

var homePage = 'scene-page';
var activePage = 'scene-page';

function showPage(pageid) {
  if(pageid) activePage = pageid;
  var compactMode = $(window).width() <= 800;
  if(compactMode) {
    $('div.pageview').hide();
    $('div#'+activePage).show();
    if(activePage === 'chat-page') {
      $('div#chat-input').css({bottom:50});
    }
  } else {
    $('div.pageview').show();
    $('div#chat-input').css({bottom:0});
  }
  var w = $('div#chat-page').width();
  $('input#chat-input-box').css({width:(w-100)});
}

$(window).resize(function (){
  showPage();
});

$(document).ready(function(){
  $('button.navbtn').on('click', function(e) {
    showPage($(this).attr('nav'));
  });

  $('button#chat-send').on('click', function(e) {
    var str = $('input#chat-input-box').val();

  });

  showPage(homePage);

  client.bind(io(), true);
});
