const eveonlinejs = Meteor.npmRequire('eveonlinejs');

Meteor.methods({
  'addKeyCharacters': function (charactersObj, keyID, vCode) {
    let runSyncResult = Async.runSync(function (done) {
      for (let charID in charactersObj) {
        Meteor.call('insertCharacter', keyID, vCode, charID);
      }
      done(null, true);
    });

    if (runSyncResult.error) throw runSyncResult.error;
    else if (runSyncResult.result) return runSyncResult.result;
  },

  'insertCharacter': function (keyID, vCode, charID) {
    let runSyncResult = Async.runSync(function (done) {
      eveonlinejs.fetch('eve:CharacterInfo', {keyID: keyID, vCode: vCode, characterID: charID}, function (err, result) {
        if (err) done(err, null);
        else {
          result.keyID = keyID;
          done(null, result);
        }
      });
    })
    if (runSyncResult.error) throw runSyncResult.error;
    else if (runSyncResult.result) {
      Characters.insert(runSyncResult.result);
      return runSyncResult.result;
    }
  },

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
