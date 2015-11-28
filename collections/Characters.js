// The Mongo collection to which our schema will be attached
Characters = new Mongo.Collection("characters");

EmploymentRecordSchema = new SimpleSchema({
  recordID: {
    type: String
  },
  corporationID: {
    type: String
  },
  corporationName: {
    type: String
  },
  startDate: {
    type: Date
  }
});

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
    type: String,
    index: true,
    unique: true
  },
  roles: {
    type: Object,
    blackbox: true
  },
  characterName: {
    type: String,
    optional: true
  },
  corporationID: {
    type: String,
    optional: true
  },
  corporationName: {
    type: String,
    optional: true
  },
  allianceID: {
    type: String,
    optional: true
  },
  allianceName: {
    type: String,
    optional: true
  },
  securityStatus: {
    type: String,
    optional: true
  },
  employmentHistory: {
    type: [EmploymentRecordSchema],
    optional: true
  },
  keyID: { // Associated API key
    type: String,
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
