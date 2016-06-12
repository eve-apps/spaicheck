/* AddKeyFormSchema is for prevalidation only, to determine if it's worth making an API call.
  KeySchema can't be used because during prevalidation, some required properties don't exist
  yet so the form would always be invalid. */
AddKeyFormSchema = new SimpleSchema({
  keyID: {
    type: Number,
    label: "Key ID",
    min: 0,
    max: 2147483647 // API returns HTTP error beyond this number
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
      method: function(doc) {
        // Prevent the page from reloading on submission
        this.event.preventDefault();

        /* If a {{quickForm}} or {{autoForm}} has both a "schema=" and a "collection=" attribute
          then "validateForm()" uses "schema" for prevalidation and if successful, runs the "before"
          hook for further validation */
        formIsValid = AutoForm.validateForm('insertKeyForm');

        if (formIsValid) this.result(doc); // Successfully complete form submission, and call insertKey()
        else this.result(false); // Cancel form submission
      }
    }
  }
});

/**
 * Event Handlers
 **/

Template.addKey.events({
  'submit .csv': function (event) {
    event.preventDefault();

    const csvData = event.target.csvBox.value;
    Meteor.call('insertKeysBulk', csvData);

    event.target.csvBox.value = '';
  }
});
