'use strict';

import {_} from '/imports/shared/globals';

const getAuthLevel = function (user) {
  let isLoggedIn, characterID, isAdmin, isWhitelisted;
  isLoggedIn = user;

  if (isLoggedIn) {
    characterID = Meteor.users.findOne(user).profile.eveOnlineCharacterId;
    isAdmin = characterID === Meteor.settings.public.adminID;
    isWhitelisted = Whitelist.findOne({characterID: String(characterID)});
  }

  if (isAdmin) return "admin";
  else if (isWhitelisted) return "whitelist";
  else return "anon";
}

Meteor.publish('authorizedPub', function () {
  if (getAuthLevel(this.userId) === "admin" || getAuthLevel(this.userId) === "whitelist") {
    let cursors = [
      Changes.find({}),
      Characters.find({}),
      Errors.find({}),
      Keys.find({}),
      Whitelist.find({}, {fields: {characterID: 1}})
    ];

    return cursors;
  }
  else {
    this.ready();
  }
});

Meteor.publish('adminPub', function () {
  if (getAuthLevel(this.userId) === "admin") {
    return Whitelist.find({});
  }
  else {
    this.ready();
  }
});
