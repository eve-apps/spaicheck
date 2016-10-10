'use strict';

import {_} from '/imports/shared/globals';

Meteor.methods({
  'addKeyCharacters': async function (keyID) {
    Characters.remove({keyID: keyID});

    let charactersObj = Keys.findOne({"keyID": keyID}).resultBody.characters;

    let promises = _.map(charactersObj, (charID) => callPromise('insertCharacter', keyID, charID));

    await Promise.all(promises);

    await callPromise('detectPrimaryCharacter', keyID);

    return true;
  },

  'insertCharacter': async function (keyID, charID) {
    const vCode = Keys.findOne({keyID: keyID}).vCode;

    let characterInfo = await eveFetch('eve:CharacterInfo', {keyID: keyID, vCode: vCode, characterID: charID});

    if (characterInfo && !Characters.findOne({characterID: characterInfo.characterID})) {
      characterInfo.keyID = keyID;
      Characters.insert(characterInfo);
    }
    else {
      console.log('will not insert character');
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

          if (record.corporationID === Meteor.settings.public.corporationID) {
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
    let primaryChar = 'no character';
    if (!charList.length) {
      console.warn('Account has no characters!');
    } else {
      if (charList.length > 1) {
        inCorpList = charList.filter((char) => char.corporationID === Meteor.settings.public.corporationID);

        if (inCorpList.length > 1) {
          inCorpList = [findOldestChar(inCorpList)];
        }
        charList = inCorpList.length != 0 ? inCorpList : charList;
      }

      if (charList.length > 1) {
        inAllianceList = charList.filter((char) => char.allianceID === Meteor.settings.public.allianceID);
        charList = inAllianceList.length != 0 ? inAllianceList : charList;
      }

      if (charList.length > 1) {
        charList.sort((a, b) => b.skillPoints - a.skillPoints);
      }
      primaryChar = charList[0].characterName;
    }

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
