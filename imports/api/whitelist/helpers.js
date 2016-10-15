import { Meteor } from 'meteor/meteor';
import Whitelist from '/imports/api/whitelist/Whitelist';

export const getUserCharacterId = (userId) => {
  const user = Meteor.users.findOne(userId);
  if (!user) return null;
  return user.profile.eveOnlineCharacterId;
};

export const getUserCharacterName = (userId) => {
  const user = Meteor.users.findOne(userId);
  if (!user) return null;
  return user.profile.eveOnlineCharacterName;
};

export const characterIsAdmin = characterID => characterID === Meteor.settings.public.adminID;
export const userIsAdmin = userId => characterIsAdmin(getUserCharacterId(userId));

// FIXME: If the user is a character called 'null', this will think they're on the whitelist.
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
