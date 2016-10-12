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

  console.log('findOldestChar defined');

  // detectPrimaryCharacter Body
  let charList = await Characters.find({keyID: keyID}).fetch();

  console.log('Characters fetched from db', charList);
  let primaryChar = 'no character';
  if (!charList.length) {
    console.warn('Account has no characters!');
  } else {
    console.log(`Account has ${charList.length} characters`);
    if (charList.length > 1) {
      console.warn('000');
      let inCorpList = charList.filter((char) => char.corporationID === Meteor.settings.public.corporationID);
      console.warn('a');

      if (inCorpList.length > 1) {
        console.warn('b');
        inCorpList = [findOldestChar(inCorpList)];
        console.warn('c');
      }
      charList = inCorpList.length != 0 ? inCorpList : charList;
      console.warn('d');
    }

    if (charList.length > 1) {
      console.warn('d');
      inAllianceList = charList.filter((char) => char.allianceID === Meteor.settings.public.allianceID);
      console.warn('e');
      charList = inAllianceList.length != 0 ? inAllianceList : charList;
      console.warn('f');
    }

    if (charList.length > 1) {
      console.warn('g');
      charList.sort((a, b) => b.skillPoints - a.skillPoints);
      console.warn('h');
    }
    console.warn('i');
    primaryChar = charList[0].characterName;
    console.warn('k');
  }
  console.log('detectPrimaryCharacter exited');
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

  let promises = Object.entries(charactersObj).map((character) => {
    console.log('character:', character[1]);
    return insertCharacter(keyID, character[0]);
  });

  let results = await Promise.all(promises);

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    import util from 'util';
    console.log(`result ${i} = ${util.inspect(result, false, null)}`);
  }

  console.log('done displaying results');

  let primary = await detectPrimaryCharacter(keyID);
  console.log('primary character: ' + primary);
  await setPrimaryCharacter(keyID, primary);
  console.log('primary character saved in db');
};


Meteor.methods({
  'addKeyCharacters': async function (keyID) {
    await addKeyCharacters(keyID);
  },
  'setPrimaryCharacter': async function (keyID, charName) {
    await setPrimaryCharacter(keyID, charName);
  }
});
