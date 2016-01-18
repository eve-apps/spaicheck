Meteor.methods({
  'insertKey': function (doc) {
    Keys.insert(doc, {removeEmptyStrings: false});
  }
});
