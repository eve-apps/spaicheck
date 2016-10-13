'use strict';

// TODO: Check if lodash is a default export
import _ from 'lodash';

import { eveonlinejs, eveFetch } from '/imports/server/eveFetch';

import Keys from '/imports/api/keys/Keys';
import Characters from '/imports/api/characters/Characters';

// TODO: Import moment

const insertCharacter = async function insertCharacter (keyID, charID) {
  const vCode = await Keys.findOne({keyID: keyID}).vCode;

  console.log('>>>about to fetch from api');
  try {
    let characterInfo = await eveFetch('eve:CharacterInfo', {keyID: keyID, vCode: vCode, characterID: charID});
    console.log('>>>fetched from api');

    if (characterInfo && !(await Characters.findOne({characterID: characterInfo.characterID}))) {
      console.log('characterInfo is here');
      characterInfo.keyID = keyID;
      await Characters.insert(characterInfo);
      return characterInfo.characterName;
    }
    else {
      console.log('will not insert character');
    }
  }
  catch (e) {
    console.error(e);
  }
};

const detectPrimaryCharacter = async function detectPrimaryCharacter (keyID) {
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

          let thisStartDate = moment(record.startDate);

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
  let charList = await Characters.find({keyID: keyID}).fetch();

  console.log(`${charList.length} characters fetched from db`);
  let primaryChar = 'no character';
  if (!charList.length) {
    console.warn('Account has no characters!');
  } else {
    if (charList.length > 1) {
      let inCorpList = charList.filter((char) => char.corporationID === Meteor.settings.public.corporationID);

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

  return primaryChar;
};

const setPrimaryCharacter = async function (keyID, charName) {
  await Keys.update(
    {keyID},
    {
      $set: {
        primaryChar: charName
      }
    }
  );
  console.log('Primary character for key #' + keyID + ' has been set to ' + charName + '.');
};

const addKeyCharacters = async function addKeyCharacters (keyID) {
  await Characters.remove({keyID: keyID});

  let charactersObj = await Keys.findOne({"keyID": keyID}).resultBody.characters;

  console.warn('before');
  let promises = Object.entries(charactersObj).map((character) => {
    console.log('character:', character[1]);
    return insertCharacter(keyID, character[0]);
  });

  console.warn('inbetween');
  let results = await Promise.all(promises);

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    import util from 'util';
    console.log(`character #${i}: ${util.inspect(result, false, null)}`);
  }

  console.log('done displaying results');

  let primary = await detectPrimaryCharacter(keyID);
  //console.log('primary character: ' + primary);
  await setPrimaryCharacter(keyID, primary);
  //console.log('primary character saved in db');
};


Meteor.methods({
  'addKeyCharacters': async function (keyID) {
    await addKeyCharacters(keyID);
  },
  'setPrimaryCharacter': async function (keyID, charName) {
    await setPrimaryCharacter(keyID, charName);
  }
});
