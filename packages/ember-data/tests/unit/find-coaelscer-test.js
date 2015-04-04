var Promise = Ember.RSVP.Promise;
var run = Ember.run;
var User, Boat, Comment;
var store, finder;

module('FindCoalescer', {
  setup: function() {
    store = createStore({
      adapter: DS.RESTAdapter.extend({
        // Copied and modified from adapters/rest-adapter/group-records-for-find-many-test.js
        ajax: function(url, type, options) {
          var key = url.split('/')[1];
          var testRecords = options.data.ids.map(function(id) {
            return { id: id };
          });
          var result = {};
          result[key] = testRecords;
          return Promise.resolve(result);
        }
      })
    });

    store.modelFactoryFor = function (key) {
      return {
        'user': User,
        'boat': Boat,
        'comment': Comment
      }[key];
    };

    finder = new DS.Store.FindCoalescer(store);

    // Because we're stubbing out the model factories we need to manually
    // set the typeKey
    User = DS.Model.extend({});
    User.typeKey = 'user';
    Boat = DS.Model.extend({});
    Boat.typeKey = 'boat';
    Comment = DS.Model.extend({});
    Comment.typeKey = 'comment';
  }
});

test('exists', function() {
  ok(DS.Store.FindCoalescer);
});

test('find 3 of same type: all succeed', function() {
  var first, second, third;

  stop();
  expect(3);

  run(function () {
    finder._begin();
    first  = finder.find(User, 1);
    second = finder.find(User, 2);
    third  = finder.find(User, 3);

    run.scheduleOnce('afterRender', function () {
      Promise.all([first, second, third]).then(function() {
        start();
        //TODO:  What is a better set of assertions?
        equal(first._result.id, '1');
        equal(second._result.id, '2');
        equal(third._result.id, '3');
      });
    });
  });
});

// test('findMany 3 of same type: all succeed', function() {
//   var firstThree  = finder.findMany('user', [1, 2, 3]);
//   return firstThree.then(function() {
//     // completed
//   });
// });

// test('find 3 of same type: two succeed one fails', function() {
//   var first  = finder.find('user', 1);
//   var second = finder.find('user', 2);
//   var third  = finder.find('user', 3);

//   return Promise.all([first, second, third]).then(function() {
//     // completed
//   });
// });

// test('find 3 of same type: all three fail', function() {
//   var first  = finder.find('user', 1);
//   var second = finder.find('user', 2);
//   var third  = finder.find('user', 3);

//   return Promise.all([first, second, third]).then(function() {
//     // completed
//   });
// });

// test('find 3 of different types: all succeed', function() {
//   var first  = finder.find('boat', 1);
//   var second = finder.find('user', 2);
//   var third  = finder.find('comment', 3);

//   return Promise.all([first, second, third]).then(function() {
//     // completed
//   });
// });

// test('find 3 of different types: first succeeds second fails', function() {
//   var first  = finder.find('boat', 1);
//   var second = finder.find('user', 2);
//   var third  = finder.find('comment', 3);

//   return Promise.all([first, second, third]).then(function() {
//     // completed
//   });
// });

// test('find 3 of different types: all fail', function() {
//   var first  = finder.find('boat', 1);
//   var second = finder.find('user', 2);
//   var third  = finder.find('comment', 3);

//   return Promise.all([first, second, third]).then(function() {
//     // completed
//   });
// });
