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

/**
 * Event Handlers
 **/

Template.validateKeys.events({
  "click .validate-button": function() {
    // Fetch all keys from the database and validate them
    // TODO: Use "Async" library to process these in parallel
    Meteor.call('runChecks');
  }
});
