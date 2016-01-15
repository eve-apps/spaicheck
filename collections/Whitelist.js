// The Mongo collection to which our schema will be attached
Whitelist = new Mongo.Collection("whitelist");

WhitelistSchema = new SimpleSchema({
  characterID: {
    type: String,
    index: true,
    unique: true
  }
});

Whitelist.attachSchema(WhitelistSchema);
