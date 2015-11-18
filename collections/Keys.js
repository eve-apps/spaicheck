Keys = new Mongo.Collection("keys");

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

      keyValidationResult = Meteor.call('validateKey', this.field("keyID").value, this.value);
      console.log(keyValidationResult);
      if (keyValidationResult.ok === true) return 0;
      else return "keyFailed";
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
