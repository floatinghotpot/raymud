exports = module.exports = function Client(socket) {
  this.reset();
  this.bind(socket);
};

Client.prototype = {
  reset: function() {
    this.uid = '';
    this.pin = '';
    this.rpc_seq = 1;
    this.rpc_callbacks = {};
    this.events = {};
  },

  on: function(event, func) {
    var callbacks = this.events[event];
    if(!callbacks) callbacks = this.events[event] = [];
    callbacks.push(func);
    return this;
  },

  off: function(event, func) {
    if(func) {
      var callbacks = this.events[event];
      if(!callbacks) return;
      var index = -1;
      while((index = callbacks.indexOf(func)) >= 0) {
        callbacks.splice(index, 1);
      }
    } else {
      this.events[event] = [];
    }
    return this;
  },

  fireEvent: function(event, args) {
    var callbacks = this.events[event];
    if(!callbacks || !Array.isArray(callbacks)) return;
    callbacks.forEach(function(func){
      if(typeof func === 'function') func(event, args);
    });
  },

  callback: function(seq, args) {
    var func = this.rpc_callbacks[seq];
    if(typeof func === 'function') func(args);
    delete this.rpc_callbacks[seq];
  },

  bind: function(sock) {
    var client = this;
    this.sock = sock;

    sock.on('notify', function(msg){
      if(sock.log_traffic) console.log('notify', msg);
      if(!msg || (typeof msg!=='object') || !msg.e) return;
      client.fireEvent(msg.e, msg.args);
    });

    sock.on('reply', function(msg){
      if(sock.log_traffic) console.log('notify', msg);
      if(!msg || (typeof msg!=='object') || !msg.seq) return;
      client.callback(msg.seq, msg.args);
    });
  },

/*
 * accepted methods and args:
 * 
 * fastsignup, 0
 * signup, {uid, passwd, name, email, phone, uuid}
 * login, {uid, passwd}
 * logout, 0
 */

  rpc: function(method, args, reply) {
    if(typeof reply !== 'function') throw new Error('rpc: callback func(err, ret) required');

    var client = this;
    var callback_func = reply;
    switch(method) {
      case 'fastsignup':
      case 'signup':
        break;
      case 'login':
        callback_func = function(err, ret) {
          if(!err) {
            client.uid = ret.token.uid;
            client.pin = ret.token.pin;
          }
          reply(err, ret);
        };
        break;
      default:
        if(!this.pin) return reply(400, 'need login first');
    }

    var seq = ++ client.seq;

    this.rpc_callbacks[seq] = {
      seq: seq,
      func: callback_func,
      t: Date.now(),
    };

    var req = {
      seq: seq,
      uid: this.uid,
      pin: client.pin,
      f: method,
      args: args,
    };
    sock.emit('rpc', req);
    if(sock.log_traffic) console.log('rpc', req);
    return this;
  },
};
