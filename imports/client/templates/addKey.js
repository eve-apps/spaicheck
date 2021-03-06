/* global window: true */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Template } from 'meteor/templating';

/* AddKeyFormSchema is for prevalidation only, to determine if it's worth making an API call.
  KeySchema can't be used because during prevalidation, some required properties don't exist
  yet so the form would always be invalid. */
window.AddKeyFormSchema = new SimpleSchema({
  keyID: {
    type: Number,
    label: 'Key ID',
    min: 0,
    max: 2147483647, // API returns HTTP error beyond this number
  },
  vCode: {
    type: String,
    label: 'Verification Code',
    regEx: /^[0-9a-zA-Z]+$/,
  },
});

// Provides extra info at the browser console. Feel free to disable.
AutoForm.debug();

AutoForm.hooks({
  insertKeyForm: {
    // "before" hook is run before the form is submitted, before db insertion
    before: {
      method (doc) {
        // Prevent the page from reloading on submission
        this.event.preventDefault();

        /* If a {{quickForm}} or {{autoForm}} has both a "schema=" and a "collection=" attribute
          then "validateForm()" uses "schema" for prevalidation and if successful, runs the "before"
          hook for further validation */
        const formIsValid = AutoForm.validateForm('insertKeyForm');

        if (formIsValid) this.result(doc); // Successfully complete form submission, and call insertKey()
        else this.result(false); // Cancel form submission
      },
    },
  },
});

/**
 * Event Handlers
 **/

Template.addKey.events({
  'submit .csv': (event) => {
    event.preventDefault();

    const csvData = event.target.csvBox.value;
    Meteor.call('bulkInsertKeys', csvData);

    // eslint-disable-next-line no-param-reassign
    event.target.csvBox.value = '';
  },
});
