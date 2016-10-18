import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { userIsAdmin } from '/imports/api/whitelist/helpers';

// The Mongo collection to which our schema will be attached
const Whitelist = new Mongo.Collection('whitelist');

const WhitelistSchema = new SimpleSchema({
  characterID: {
    type: String,
    index: true,
    unique: true,
    label: 'Character ID:',
  },
  emailAddress: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email,
    label: 'Email:',
  },
  notify: {
    type: Boolean,
    optional: true,
    label: 'Notify by email?',
  },
});

Whitelist.allow({
  insert: userId => userIsAdmin(userId),
  remove: userId => userIsAdmin(userId),
  update: userId => userIsAdmin(userId),
});

Whitelist.attachSchema(WhitelistSchema);

export default Whitelist;
