

import Errors from '/imports/api/errors/Errors';

/**
 * Page Events
 **/

Template.errorDisplay.onRendered(() => {
  $('#error-display .ui.accordion').accordion({
    selector: {
      trigger: '.show-err',
    },
  });
});

/**
 * Helpers
 **/

Template.errorDisplay.helpers({
  errors() {
    return Errors.find({});
  },
  keyErrorCount(log) {
    return log.length > 1 ? `${log.length} Errors` : `${log.length} Error`;
  },
});

/**
 * Event Handlers
 **/

Template.errorDisplay.events({
  'click .recheck': function () {
    const doc = {};
    doc.keyID = this.keyID;
    doc.vCode = this.vCode;
    Meteor.call('insertKey', doc);
  },
  'click .rm-err': function () {
    Meteor.call('discardError', this._id);
  },
});
