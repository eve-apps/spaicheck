Meteor.methods({
  'notifyChanges': function (key, changes) {
    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: mailTo,
      from: "changes@spaicheck.com",
      subject: "Key #" + key + " has changed",
      text: changes
    });
  }
});
