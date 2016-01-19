Meteor.methods({
  'insertKey': function (doc) {
    Meteor.call('detectPrimaryCharacter', doc, function (err, result) {
      if (!doc.primaryChar) doc.primaryChar = result;
      Keys.insert(doc, {removeEmptyStrings: false});
    });
  }
});
