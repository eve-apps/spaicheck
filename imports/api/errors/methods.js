import { Meteor } from 'meteor/meteor';

import Errors from '/imports/api/errors/Errors';

Meteor.methods({
  discardError: (errorId) => {
    Errors.remove(errorId);
  },
});
