'use strict';

// TODO: Import Session

Meteor.startup(function () {
  let defaultOptions = {
    useEveDurations: false
  };

  // Load session variables
  Session.setDefault('useEveDurations', defaultOptions.useEveDurations);
});
