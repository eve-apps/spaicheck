// The Mongo collection to which our schema will be attached
Characters = new Mongo.Collection("characters");

ApplicationSchema = new SimpleSchema({
  applicationID: {
    type: String,
    index: true,
    unique: true,
    sparse: true
  },
  message: {
    type: String
  },
  submittedAt: {
    type: Date
  },
  processedAt: {
    type: Date,
    optional: true
  }
});

CharacterSchema = new SimpleSchema({
  characterID: {
    type: Number,
    index: true,
    unique: true
  },
  characterName: {
    type: String,
    optional: true
  },
  corporationID: {
    type: Number,
    optional: true
  },
  corporation: {
    type: String,
    optional: true
  },
  allianceID: {
    type: Number,
    optional: true
  },
  allianceName: {
    type: String,
    optional: true
  },
  skillPoints: {
    type: Number,
    optional: true
  },
  securityStatus: {
    type: String,
    optional: true
  },
  employmentHistory: {
    type: Object,
    blackbox: true,
    optional: true
  },
  keyID: { // Associated API key
    type: Number,
    optional: true
  },
  applications: { // Associated membership applications
    type: [ApplicationSchema],
    optional: true
  },
  createdAt: { // When the character was first added to the database
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  }
});

Characters.attachSchema(CharacterSchema);
