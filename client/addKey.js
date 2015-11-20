AddKeyFormSchema = new SimpleSchema({
  keyID: {
    type: Number,
    label: "Key ID",
    min: 0,
    max: 2147483647
  },
  vCode: {
    type: String,
    label: "Verification Code",
    regEx: /^[0-9a-zA-Z]+$/
  }
})

AutoForm.debug();

AutoForm.hooks({
  insertKeyForm: {
    before: {
      insert: function(doc) {
        this.event.preventDefault();
        formIsValid = AutoForm.validateForm('insertKeyForm');

        if (formIsValid) {
          let self = this;
          Meteor.apply('validateKey', [doc.keyID, doc.vCode], true, function(err, result) {
            if (err) {
              self.result(false);
            }
            else {
              doc.status = result.result;
              self.result(doc);
            }
          });
        }
        else this.result(false);
      }
    }
  }
});
