Keys = new Mongo.Collection("keys");

KeySchema = new SimpleSchema({
  keyID: {
    type: String
  },
  vCode: {
    type: String
  }
});

Keys.attachSchema(KeySchema);
