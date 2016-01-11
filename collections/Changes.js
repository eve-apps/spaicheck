// The Mongo collection to which our schema will be attached
Changes = new Mongo.Collection("changes");

SingleChangeSchema = new SimpleSchema({
  changeType: {
    type: String
  },
  data: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

ChangeObjectSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    // createdAt property is auto-created when an insertion to the db is made
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return new Date;
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },
  changes: {
    type: [SingleChangeSchema]
  }
});

ChangeSchema = new SimpleSchema({
  keyID: {
    type: Number,
    index: true,
    unique: true,
    sparse: true
  },
  playerName: {
    type: String,
    optional: true
  },
  log: {
    type: [ChangeObjectSchema],
    optional: true
  }
});

Changes.attachSchema(ChangeSchema);
