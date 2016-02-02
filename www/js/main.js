var client = new LoginClient();

client.on('hello', function(event, args){

});

client.on('notify', function(event, args){

});

var homePage = 'page-scene';
var activePage = 'page-scene';

function showPage(pageid) {
  if(pageid) activePage = pageid;
  var compactMode = $(window).width() <= 800;
  if(compactMode) {
    $('div.pageview').hide();
    $('div#'+activePage).show();
    if(activePage === 'page-chat') {
      $('div#chat-input').css({bottom:50});
    }
  } else {
    $('div.pageview').show();
    $('div#chat-input').css({bottom:0});
  }
  var w = $('div#page-chat').width();
  $('input#chat-input-box').css({width:(w-100)});
}

$(window).resize(function (){
  showPage();
});

$(document).ready(function(){
  $('button.navbtn').on('click', function(e){
    showPage($(this).attr('nav'));
  });

  showPage(homePage);

  //client.bind(io(), true);

});
