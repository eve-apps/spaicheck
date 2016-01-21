const eveonlinejs = Meteor.npmRequire('eveonlinejs');

Meteor.methods({
  'detectPrimaryCharacter': function (keyObj) {
    // eveonlinejs.fetch('server:ServerStatus', {}, function (err, result) {
    let runSyncResult = Async.runSync(function (done) {
      charactersObj = keyObj.resultBody.characters;
      for (let charID in charactersObj) {
        eveonlinejs.fetch('eve:CharacterInfo', {keyID: keyObj.keyID, vCode: keyObj.vCode, characterID: charID}, function (err, result) {
          if (err) done(err, null);
          else done(null, result);
        });
      }
    })
    if (runSyncResult.error) throw runSyncResult.error;
    else if (runSyncResult.result) return runSyncResult.result.characterName;
  },
  'setPrimaryCharacter': function (keyID, charName) {
    Keys.update(
      {keyID: keyID},
      {
        $set: {
          primaryChar: charName
        }
      }
    );
  }
});
