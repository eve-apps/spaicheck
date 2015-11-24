/* AddKeyFormSchema is for prevalidation only, to determine if it's worth making an API call.
  KeySchema can't be used because during prevalidation, some required properties don't exist
  yet so the form would always be invalid. */
AddKeyFormSchema = new SimpleSchema({
  keyID: {
    type: Number,
    label: "Key ID",
    min: 0,
    // API returns HTTP error beyond this number
    max: 2147483647
  },
  vCode: {
    type: String,
    label: "Verification Code",
    regEx: /^[0-9a-zA-Z]+$/
  }
})

// Provides extra info at the browser console. Feel free to disable.
AutoForm.debug();

AutoForm.hooks({
  insertKeyForm: {
    // "before" hook is run before the form is submitted, before db insertion
    before: {
      insert: function(doc) {
        // Prevent the page from reloading on submission
        this.event.preventDefault();

        /* If a {{quickForm}} or {{autoForm}} has both a "schema=" and a "collection=" attribute
          then "validateForm()" uses "schema" for prevalidation and if successful, runs the "before"
          hook for further validation */
        formIsValid = AutoForm.validateForm('insertKeyForm');

        if (formIsValid) {
          // Prevent duplicate keys
          if (Keys.findOne(doc.keyID)) {
            this.result(false);
            return;
          }
          // Storing context because "this.result()" is not available from within the Meteor method
          let self = this;
          // The third argument to "validateKey()" is "wait"
          // It tells the client to not run any more functions until this method has returned
          Meteor.apply('validateKey', [doc.keyID, doc.vCode], true, function(err, result) {
            if (err) {
              // Cancel form submission
              self.result(false);
            }
            else {
              doc.status = result;
              // Successfully complete form submission, and insert "doc" to the database
              self.result(doc);
            }
          });
        }
        // Cancel form submission
        else this.result(false);
      }
    }
  }
});
