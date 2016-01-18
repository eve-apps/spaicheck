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
    let keyID = this.keyID;
    let vCode = this.vCode;
    Meteor.call('validateKey', keyID, vCode, function(err, result) {
      if (err) {
        Meteor.call('logKeyError', keyID, vCode, err);
      } //log error
      else Meteor.call('insertKey', result);
    });
  },
  'click .rm-err': function () {
    Errors.remove(this._id);
  }
});
