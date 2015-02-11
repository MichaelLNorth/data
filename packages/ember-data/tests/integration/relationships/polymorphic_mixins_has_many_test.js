var env, store, User, Message, Video;
var run = Ember.run;

var attr = DS.attr;
var hasMany = DS.hasMany;
var belongsTo = DS.belongsTo;

function stringify(string) {
  return function() { return string; };
}

module('integration/relationships/polymorphic_mixins_has_many_test - Polymorphic hasMany relationships with mixins', {
  setup: function() {
    User = DS.Model.extend({
      name: attr('string'),
      messages: hasMany('message', { async: true, polymorphic: true })
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

test("Relationship is available from the belongsTo side even if only loaded from the hasMany side - async", function () {
  var user, video;
  run(function() {
    user = store.push('user', { id: 1, name: 'Stanley', messages: [{ id: 2, type: 'video' }] });
    video = store.push('video', { id: 2, video: 'Here comes Youtube' });
  });
  run(function() {
    user.get('messages').then(function(messages) {
      equal(messages.objectAt(0), video, 'The hasMany has loaded correctly');
      messages.objectAt(0).get('user').then(function(fetchedUser) {
        equal(fetchedUser, user, 'The inverse was setup correctly');
      });
    });
  });
});

/*
  Local edits
*/
test("Pushing to the hasMany reflects the change on the belongsTo side - async", function () {
  var user, video;
  run(function() {
    user = store.push('user', { id: 1, name: 'Stanley', messages: [] });
    video = store.push('video', { id: 2, video: 'Here comes Youtube' });
  });

  run(function() {
    user.get('messages').then(function(fetchedMessages) {
      fetchedMessages.pushObject(video);
      video.get('user').then(function(fetchedUser) {
        equal(fetchedUser, user, "user got set correctly");
      });
    });
  });
});

