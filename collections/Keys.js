Keys = new Mongo.Collection("keys");

KeySchema = new SimpleSchema({
  keyID: {
    type: String,
    label: "Key ID:"
  },
  vCode: {
    type: String,
    label: "Verification Code:"
  }
});

Keys.attachSchema(KeySchema);
