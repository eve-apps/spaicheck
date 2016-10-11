'use strict';

// The Mongo collection to which our schema will be attached
const Whitelist = new Mongo.Collection("whitelist");

const WhitelistSchema = new SimpleSchema({
  characterID: {
    type: String,
    index: true,
    unique: true,
    label: "Character ID:"
  },
  emailAddress: {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email,
    label: "Email:"
  },
  notify: {
    type: Boolean,
    optional: true,
    label: "Notify by email?"
  }
});

Whitelist.allow({
  insert: function (userId) {
    return Meteor.users.findOne(userId).profile.eveOnlineCharacterId === Meteor.settings.public.adminID;
  },
  remove: function (userId) {
    return Meteor.users.findOne(userId).profile.eveOnlineCharacterId === Meteor.settings.public.adminID;
  },
  update: function (userId) {
    return Meteor.users.findOne(userId).profile.eveOnlineCharacterId === Meteor.settings.public.adminID;
  }
})

Whitelist.attachSchema(WhitelistSchema);

export default Whitelist;
