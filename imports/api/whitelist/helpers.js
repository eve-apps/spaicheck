import Whitelist from '/imports/api/whitelist/Whitelist';

export const getAuthLevel = function (user) {
  let isLoggedIn, characterID, isAdmin, isWhitelisted;
  isLoggedIn = user;

  if (isLoggedIn) {
    characterID = Meteor.users.findOne(user).profile.eveOnlineCharacterId;
    isAdmin = characterID === Meteor.settings.public.adminID;
    isWhitelisted = Whitelist.findOne({ characterID: String(characterID) });
  }

  if (isAdmin) return 'admin';
  else if (isWhitelisted) return 'whitelist';
  else return 'anon';
};
