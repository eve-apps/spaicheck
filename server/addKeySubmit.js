Meteor.methods({
  'addKeySubmit': function (doc) {
    Keys.insert(doc, {removeEmptyStrings: false});
  }
});
