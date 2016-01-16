/**
 * Page Events
 **/

Template.home.onCreated(function () {
  Session.set('timer', true);
  eachSecond = Meteor.setInterval(function() {
    Session.set('timer', !Session.get('timer'));
  }, 1000);
});

Template.home.onDestroyed(function () {
  Meteor.clearInterval(eachSecond);
});
