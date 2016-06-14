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
    let cursors = [];

    cursors.push(Changes.find({}));
    cursors.push(Characters.find({}));
    cursors.push(Errors.find({}));
    cursors.push(Keys.find({}));
    cursors.push(Whitelist.find({}, {fields: {characterID: 1}}));

    return cursors;
  }
  else {
    this.ready();
  }
});
