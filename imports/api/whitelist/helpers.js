import { Meteor } from 'meteor/meteor';
import Whitelist from '/imports/api/whitelist/Whitelist';

export const getUserCharacterId = userId => Meteor.users.findOne(userId).profile.eveOnlineCharacterId;
export const getUserCharacterName = userId => Meteor.users.findOne(userId).profile.eveOnlineCharacterName;

export const characterIsAdmin = characterID => characterID === Meteor.settings.public.adminID;
export const userIsAdmin = userId => characterIsAdmin(getUserCharacterId(userId));

export const characterIsWhitelisted = characterID => Boolean(Whitelist.findOne({ characterID: String(characterID) }));
export const userIsWhitelisted = userId => characterIsWhitelisted(getUserCharacterId(userId));

export const getAuthLevel = (user) => {
  if (user) {
    const character = getUserCharacterId(user);
    if (characterIsAdmin(character)) return 'admin';
    if (characterIsWhitelisted(character)) return 'whitelist';
  }

  return 'anon';
};
