import { Meteor } from 'meteor/meteor';

import { getAuthLevel, getUserCharacterId } from '/imports/api/whitelist/helpers';

import Changes from '/imports/api/changes/Changes';
import Characters from '/imports/api/characters/Characters';
import Errors from '/imports/api/errors/Errors';
import Keys from '/imports/api/keys/Keys';
import Whitelist from '/imports/api/whitelist/Whitelist';

Meteor.publish('authorizedPub', function authorizedPub () {
  if (getAuthLevel(this.userId) === 'admin' || getAuthLevel(this.userId) === 'whitelist') {
    const cursors = [
      Changes.find({}),
      Characters.find({}),
      Errors.find({}),
      Keys.find({}),
      Whitelist.find({}, { fields: { characterID: 1 } }),
    ];

    return cursors;
  }

  return [];
});

Meteor.publish('adminPub', function adminPub () {
  if (getAuthLevel(this.userId) === 'admin') {
    return Whitelist.find({});
  }

  return [];
});

Meteor.publish('userPub', function userPub () {
  if (this.userId) {
    return [Whitelist.find({
      characterID: getUserCharacterId(this.userId),
    })];
  }

  return [];
});
