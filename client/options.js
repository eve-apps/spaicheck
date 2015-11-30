Meteor.startup(function () {
  defaultOptions = {
    useEveDurations: false
  };
  curOptions = {};

// Load session variables
  curOptions.useEveDurations = Session.get('useEveDurations') || defaultOptions.useEveDurations;
});
