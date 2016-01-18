// The Mongo collection to which our schema will be attached
Errors = new Mongo.Collection("errors");

ErrorMessageSchema = new SimpleSchema({
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
  error: {
    type: String
  },
  reason: {
    type: String
  }
})

ErrorSchema = new SimpleSchema({
  keyID: {
    type: Number,
    index: true,
    unique: true,
    sparse: true
  },
  vCode: {
    type: String
  },
  playerName: {
    type: String,
    optional: true
  },
  log: {
    type: [ErrorMessageSchema]
  }
});

Errors.attachSchema(ErrorSchema);
