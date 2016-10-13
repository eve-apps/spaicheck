

// The Mongo collection to which our schema will be attached
const Errors = new Mongo.Collection('errors');

const ErrorMessageSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    // createdAt property is auto-created when an insertion to the db is made
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return new Date();
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
  },
  error: {
    type: String,
  },
  reason: {
    type: String,
  },
});

const ErrorSchema = new SimpleSchema({
  keyID: {
    type: Number,
    index: true,
    unique: true,
    sparse: true,
  },
  vCode: {
    type: String,
  },
  playerName: {
    type: String,
    optional: true,
  },
  log: {
    type: [ErrorMessageSchema],
  },
});

Errors.attachSchema(ErrorSchema);

export default Errors;
