import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// The Mongo collection to which our schema will be attached
const Changes = new Mongo.Collection('changes');

const SingleChangeSchema = new SimpleSchema({
  changeType: {
    type: String,
    allowedValues: [
      'INTERNAL',
      'CONNERR',
      'UNHANDLED',
      'MALFORMEDKEY',
      'INVALIDKEY',
      'CORPKEY',
      'BADMASK',
      'EXPIRES',
      'addCharacter',
      'removeCharacter',
      'joinCorp',
      'leaveCorp',
      'switchCorp',
      'removeCharacter',
      'joinAlliance',
      'leaveAlliance',
      'switchAlliance',
    ],
  },
  severity: {
    type: String,
    allowedValues: ['WARNING', 'ERROR'],
  },
  oldValueStr: {
    type: String,
    optional: true,
  },
  oldValueObj: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  newValueStr: {
    type: String,
    optional: true,
  },
  newValueObj: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  context: {
    type: Object,
    optional: true,
    blackbox: true,
  },
});

const ChangeObjectSchema = new SimpleSchema({
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
  changes: {
    type: [SingleChangeSchema],
  },
  reviewed: {
    type: Boolean,
  },
});

const ChangeSchema = new SimpleSchema({
  keyID: {
    type: Number,
    index: true,
    unique: true,
    sparse: true,
  },
  playerName: {
    type: String,
    optional: true,
  },
  log: {
    type: [ChangeObjectSchema],
    optional: true,
  },
});

Changes.attachSchema(ChangeSchema);

export default Changes;
