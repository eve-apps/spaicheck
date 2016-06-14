/**
 * Page Events
 **/

Template.errorDisplay.onRendered(function () {
  $('#error-display .ui.accordion').accordion({
    selector: {
      trigger: '.show-err'
    }
  });
});

/**
 * Helpers
 **/

Template.errorDisplay.helpers({
  errors: function () {
    return Errors.find({});
  },
  keyErrorCount: function (log) {
    return log.length > 1 ? log.length + " Errors" : log.length + " Error";
  }
});

/**
 * Event Handlers
 **/

Template.errorDisplay.events({
  'click .recheck': function () {
    let doc = {};
    doc.keyID = this.keyID;
    doc.vCode = this.vCode;
    Meteor.call('insertKey', doc);
  },
  'click .rm-err': function () {
    Meteor.call('discardError', this._id);
  }
});
