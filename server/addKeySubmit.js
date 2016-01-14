Meteor.methods({
  'addKeySubmit': function (doc) {
    doc.status = 'GOOD';
    Keys.insert(doc, {removeEmptyStrings: false});
  }
});
