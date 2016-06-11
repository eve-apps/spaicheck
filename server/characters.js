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
    // Function Declarations
    const findOldestChar = (chars) => {
      let oldestStartDate = moment();
      let oldestChar = null;

      chars.forEach((char) => {
        for (recordID in char.employmentHistory) {
          let record = char.employmentHistory[recordID];

          if (record.corporationID == Meteor.settings.public.corporationID) {
            if (oldestChar == null) {
              oldestChar = char;
            }

            thisStartDate = moment(record.startDate);

            if (thisStartDate.isBefore(oldestStartDate)) {
              oldestStartDate = thisStartDate;
              oldestChar = char;
            }
          }
        }
      });

      return oldestChar;
    };

    // detectPrimaryCharacter Body
    let charList = Characters.find({keyID: keyID}).fetch();

    if (charList.length > 1) {
      inCorpList = charList.filter((char) => char.corporationID == Meteor.settings.public.corporationID);

      if (inCorpList.length > 1) {
        inCorpList = [findOldestChar(inCorpList)];
      }
      charList = inCorpList.length != 0 ? inCorpList : charList;
    }

    if (charList.length > 1) {
      inAllianceList = charList.filter((char) => char.allianceID == Meteor.settings.public.allianceID);
      charList = inAllianceList.length != 0 ? inAllianceList : charList;
    }

    if (charList.length > 1) {
      charList.sort((a, b) => b.skillPoints - a.skillPoints);
    }

    const primaryChar = charList[0].characterName;
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
