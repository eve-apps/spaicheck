Meteor.startup(function () {
  defaultOptions = {
    useEveDurations: false
  };

  // Load session variables
  Session.setDefault('useEveDurations', defaultOptions.useEveDurations);
});
