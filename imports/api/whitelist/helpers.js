import { Meteor } from 'meteor/meteor';
import Whitelist from '/imports/api/whitelist/Whitelist';

export const getUserCharacter = userId => Meteor.users.findOne(userId).profile.eveOnlineCharacterId;

export const characterIsAdmin = characterID => characterID === Meteor.settings.public.adminID;
export const userIsAdmin = userId => characterIsAdmin(userCharacter(userId));

export const characterIsWhitelisted = characterID => Boolean(Whitelist.findOne({ characterID: String(characterID) }));
export const userIsWhitelisted = userId => characterIsWhitelisted(userCharacter(userId));

export const getAuthLevel = (user) => {
  if (user) {
    const character = getUserCharacter(user);
    if (characterIsAdmin(character)) return 'admin';
    if (characterIsWhitelisted(character)) return 'whitelist';
  }

  return 'anon';
};
