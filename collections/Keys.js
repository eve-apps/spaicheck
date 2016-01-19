// The Mongo collection to which our schema will be attached
Keys = new Mongo.Collection("keys");

ResultBodySchema = new SimpleSchema({
  accessMask: {
    type: Number
  },
  type: {
    type: String
  },
  expires: {
    type: String,
    optional: true,
    custom: function () {
      if (!this.operator && this.value == null) {
        return "required";
      }
    }
  },
  characters: {
    type: Object,
    blackbox: true
  }
});

KeySchema = new SimpleSchema({
  keyID: {
    type: Number,
    label: "Key ID",
    min: 0,
    max: 2147483647, // API returns HTTP error beyond this number
    index: true,
    unique: true,
    sparse: true
  },
  vCode: {
    type: String,
    label: "Verification Code",
    regEx: /^[0-9a-zA-Z]+$/ // Only allow numbers and upper-case and lower-case letters
  },
  primaryChar: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    allowedValues: ['GOOD', 'WARNING', 'ERROR'],
    autoValue: function() {
      if (this.isInsert) return 'GOOD'; // Key is verified before insertion
    },
    autoform: {
      omit: true
    }
  },
  createdAt: {
    type: Date,
    // createdAt property is auto-created when an insertion to the db is made
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
    autoform: {
      omit: true // Don't render this field on quickForms
    }
  },
  resultBody: {
    type: ResultBodySchema,
    optional: true,
    autoform: {
      omit: true // Don't render this field on quickForms
    }
  }
});

// Customize form error messages here
KeySchema.messages({
  "minNumber keyID": "[label] must be a positive number",
  "keyIDMissing": "You must enter a Key ID",
  "keyIDInvalid": "Key ID is invalid",
  "regEx vCode": "[label] must contain only letters and numbers",
  "keyFailed": "The API key failed verification with the server"
});
Keys.attachSchema(KeySchema);
