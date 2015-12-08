Meteor.methods({
  'notifyChanges': function (changes) {
    console.log("This will eventually send an email with: " + changes);
  }
});
