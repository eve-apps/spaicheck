import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// The Mongo collection to which our schema will be attached
const Errors = new Mongo.Collection('errors');

const ErrorMessageSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    // createdAt property is auto-created when an insertion to the db is made
    autoValue () {
      if (this.isInsert) {
        return new Date();
      }
      if (this.isUpsert) {
        return new Date();
      }
      this.unset();  // Prevent user from supplying their own value
      return undefined;
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
