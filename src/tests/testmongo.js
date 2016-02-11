'use strict';

var test = require('tape');
var mongojs = require('mongojs');

test('MongoDB', (t) => {
  t.plan(4);

  var db = mongojs('es3');
  var users = db.collection('users');
  users.save({
    uid: 'zhang3',
    passwd: 'abc123',
    email: 'abc123@gmail.com',
    name: '张三',
  }, function(err, saved) {
    t.equal(!err, true);
    t.equal(saved.passwd, 'abc123');
    users.find(function(e, docs) {
      t.equal(!e, true);
      t.equal(docs.length, 10);
      db.close();
    });
  });
});
