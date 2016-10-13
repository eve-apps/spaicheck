

/**
 * Page Events
 **/

let eachSecond;

Template.home.onCreated(() => {
  Session.set('timer', true);
  eachSecond = Meteor.setInterval(() => {
    Session.set('timer', !Session.get('timer'));
  }, 1000);
});

Template.home.onDestroyed(() => {
  Meteor.clearInterval(eachSecond);
});
