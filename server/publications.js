const isAuthorized = function () {
  let isLoggedIn, characterID, isAdmin, isWhitelisted;
  isLoggedIn = this.userId;

  if (isLoggedIn) {
    characterID = Meteor.users.findOne(this.userId).profile.eveOnlineCharacterId
    isAdmin = characterID == Meteor.settings.public.adminID;
    isWhitelisted = Whitelist.findOne({characterID: String(characterID)});
  }

  return isLoggedIn && (isAdmin || isWhitelisted);
}

Meteor.publish('authorizedPub', function () {
  if (isAuthorized.call(this)) {
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
