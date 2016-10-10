'use strict';

import {_} from '/imports/shared/globals';

Meteor.startup(function () {
  defaultOptions = {
    useEveDurations: false
  };

  // Load session variables
  Session.setDefault('useEveDurations', defaultOptions.useEveDurations);
});
