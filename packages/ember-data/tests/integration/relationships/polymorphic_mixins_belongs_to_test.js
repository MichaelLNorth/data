var env, store, User, Message, Video;
var run = Ember.run;

var attr = DS.attr;
var belongsTo = DS.belongsTo;

function stringify(string) {
  return function() { return string; };
}

module('integration/relationships/polymorphic_mixins_belongs_to_test - Polymorphic belongsTo relationships with mixins', {
  setup: function() {
    User = DS.Model.extend({
      name: attr('string'),
      bestMessage: belongsTo('message', { async: true, polymorphic: true })
    });
    User.toString = stringify('User');

    Message = Ember.Mixin.create({
      title: attr('string'),
      user: belongsTo('user', { async: true })
    });
    Message.toString = stringify('Message');

    Video = DS.Model.extend(Message, {
      video: attr()
    });

    env = setupStore({
      user: User,
      video: Video
    });

    env.container.register('mixin:message', Message);
    store = env.store;
  },

  teardown: function() {
    run(env.container, 'destroy');
  }
});

/*
  Server loading tests
*/

test("Relationship is available from the belongsTo side even if only loaded from the inverse side - async", function () {
  var user, video;
  run(function() {
    user = store.push('user', { id: 1, name: 'Stanley', bestMessage: 2, bestMessageType: 'video' });
    video = store.push('video', { id: 2, video: 'Here comes Youtube' });
  });
  run(function() {
    user.get('bestMessage').then(function(message) {
      equal(message, video, 'The message was loaded correctly');
      message.get('user').then(function(fetchedUser) {
        equal(fetchedUser, user, 'The inverse was setup correctly');
      });
    });
  });
});

/*
  Local edits
*/
test("Setting the polymorphic belongsTo gets propagated to the inverse side - async", function () {
  var user, video;
  run(function() {
    user = store.push('user', { id: 1, name: 'Stanley' });
    video = store.push('video', { id: 2, video: 'Here comes Youtube' });
  });

  run(function() {
    user.set('bestMessage', video);
    video.get('user').then(function(fetchedUser) {
      equal(fetchedUser, user, "user got set correctly");
    });
    user.get('bestMessage').then(function(message) {
      equal(message, video, 'The message was set correctly');
    });
  });
});

