Meteor.methods({
  'notifyChanges': function (key, changes) {
    console.log("This will eventually send an email with: \nKey #" + key + " has changed: " + changes);
  }
});
