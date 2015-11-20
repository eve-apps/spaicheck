AutoForm.hooks({
  insertKeyForm: {
    before: {
      insert: function(doc) {
        let self = this;
        console.log(doc);
        Meteor.apply('validateKey', [doc.keyID, doc.vCode], true, function(err, result) {
          if (err) self.result(false);
          doc.status = result;
          console.log(doc.status);
          self.result(doc);
        });
      }
    }
  }
});
