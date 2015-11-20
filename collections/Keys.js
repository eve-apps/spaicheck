Keys = new Mongo.Collection("keys");

StatusSchema = new SimpleSchema({
    ok: {
      type: Boolean,
      optional: true
    },
    reasons: {
      type: [String],
      optional: true
    },
    lastChecked: {
      type: Date,
      optional: true
    },
    error: {
      type: String,
      optional: true
    }
});

KeySchema = new SimpleSchema({
  keyID: {
    type: Number,
    label: "Key ID",
    min: 0
  },
  vCode: {
    type: String,
    label: "Verification Code",
    regEx: /^[0-9a-zA-Z]+$/,
    custom: function() {
      if (this.field("keyID").isSet === false) return "keyIDMissing";
      if (this.field("keyID").value < 0) return "keyIDInvalid";
    }
  },
  createdAt: {
    type: Date,
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
      omit: true
    }
  },
  status: {
    type: StatusSchema,
    // optional: true,
    autoform: {
      omit: true
    }
  }
});

KeySchema.messages({
  "minNumber keyID": "[label] must be a positive number",
  "keyIDMissing": "You must enter a Key ID",
  "keyIDInvalid": "Key ID is invalid",
  "regEx vCode": "[label] must contain only letters and numbers",
  "keyFailed": "The API key failed verification with the server"
});
Keys.attachSchema(KeySchema);
