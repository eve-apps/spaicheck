Meteor.methods({
  'notifyChanges': function (charName, changes) {
    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: Meteor.settings.private.mailTo,
      from: "changes@spaicheck.com",
      subject: "Key for " + charName + " has changed",
      text: changes
    });
  }
});
