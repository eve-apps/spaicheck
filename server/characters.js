const eveonlinejs = Meteor.npmRequire('eveonlinejs');

Meteor.methods({
  'addKeyCharacters': function (keyID) {
    Characters.remove({keyID: keyID});

    let runSyncResult = Async.runSync(function (done) {
      charactersObj = Keys.findOne({"keyID": keyID}).resultBody.characters;

      for (charID in charactersObj) {
        Meteor.call('insertCharacter', keyID, charID);
      }

      Meteor.call('detectPrimaryCharacter', keyID);
      done(null, true);
    });

    if (runSyncResult.error) throw runSyncResult.error;
    else if (runSyncResult.result) return runSyncResult.result;
  },

  'insertCharacter': function (keyID, charID) {
    const vCode = Keys.findOne({keyID: keyID}).vCode;

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

  'detectPrimaryCharacter': function (keyID) {
    let charList = Characters.find({keyID: keyID}).fetch();

    charList.sort(function (a, b) {
      let aInCorporation = a.corporationID == Meteor.settings.public.corporationID;
      let bInCorporation = b.corporationID == Meteor.settings.public.corporationID;
      let aInAlliance = a.allianceID == Meteor.settings.public.allianceID;
      let bInAlliance = b.allianceID == Meteor.settings.public.allianceID;

      if (aInCorporation && !bInCorporation) return -1;
      else if (bInCorporation && !aInCorporation) return 1;
      else if (aInAlliance && !bInAlliance) return -1;
      else if (bInAlliance && !aInAlliance) return 1;
      else if (a.skillPoints > b.skillPoints) return -1;
      else if (b.skillPoints > a.skillPoints) return 1;
    });

    let primaryChar = charList[0].characterName;
    Meteor.call('setPrimaryCharacter', keyID, primaryChar)
    return primaryChar;
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
    console.log('Primary character for key #' + keyID + ' has been set to ' + charName + '.');
  }
});
