import { Meteor } from 'meteor/meteor';
import Whitelist from '/imports/api/whitelist/Whitelist';

export const characterIsAdmin = characterID => characterID === Meteor.settings.public.adminID;
export const userIsAdmin = userId => characterIsAdmin(Meteor.users.findOne(userId).profile.eveOnlineCharacterId);

export const characterIsWhitelisted = characterID => Boolean(Whitelist.findOne({ characterID: String(characterID) }));
export const userIsWhitelisted = userId => characterIsWhitelisted(Meteor.users.findOne(userId).profile.eveOnlineCharacterId);

export const getAuthLevel = (user) => {
  if (user) {
    if (userIsAdmin(user)) return 'admin';
    if (userIsWhitelisted(user)) return 'whitelist';
  }

  return 'anon';
};
