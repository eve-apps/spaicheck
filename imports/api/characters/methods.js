import { Meteor } from 'meteor/meteor';

import moment from 'moment';
import util from 'util';

import { eveFetch } from '/imports/server/eveFetch';

import Keys from '/imports/api/keys/Keys';
import Characters from '/imports/api/characters/Characters';

const insertCharacter = async (keyID, charID) => {
  const vCode = await Keys.findOne({ keyID }).vCode;

  console.log('>>>about to fetch from api');
  try {
    const characterInfo = await eveFetch('eve:CharacterInfo', { keyID, vCode, characterID: charID });
    console.log('>>>fetched from api');

    if (characterInfo && !(await Characters.findOne({ characterID: characterInfo.characterID }))) {
      console.log('characterInfo is here');
      characterInfo.keyID = keyID;
      await Characters.insert(characterInfo);
      return characterInfo.characterName;
    }

    console.log('will not insert character');
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const detectPrimaryCharacter = async (keyID) => {
  // Function Declarations
  const findOldestChar = (chars) => {
    let oldestStartDate = moment();
    let oldestChar = null;

    chars.forEach((char) => {
      char.employmentHistory.keys().forEach((recordID) => {
        const record = char.employmentHistory[recordID];

        if (record.corporationID === Meteor.settings.public.corporationID) {
          if (oldestChar == null) {
            oldestChar = char;
          }

          const thisStartDate = moment(record.startDate);

          if (thisStartDate.isBefore(oldestStartDate)) {
            oldestStartDate = thisStartDate;
            oldestChar = char;
          }
        }
      });
    });

    return oldestChar;
  };

  // detectPrimaryCharacter Body
  let charList = await Characters.find({ keyID }).fetch();

  console.log(`${charList.length} characters fetched from db`);
  let primaryChar = 'no character';
  if (!charList.length) {
    console.warn('Account has no characters!');
  } else {
    if (charList.length > 1) {
      let inCorpList = charList.filter(char => char.corporationID === Meteor.settings.public.corporationID);

      if (inCorpList.length > 1) {
        inCorpList = [findOldestChar(inCorpList)];
      }
      charList = inCorpList.length !== 0 ? inCorpList : charList;
    }

    if (charList.length > 1) {
      const inAllianceList = charList.filter(char => char.allianceID === Meteor.settings.public.allianceID);
      charList = inAllianceList.length !== 0 ? inAllianceList : charList;
    }

    if (charList.length > 1) {
      charList.sort((a, b) => b.skillPoints - a.skillPoints);
    }
    primaryChar = charList[0].characterName;
  }

  return primaryChar;
};

const setPrimaryCharacter = async (keyID, charName) => {
  await Keys.update(
    { keyID },
    {
      $set: {
        primaryChar: charName,
      },
    }
  );
  console.log(`Primary character for key #${keyID} has been set to ${charName}.`);
};

const addKeyCharacters = async (keyID) => {
  await Characters.remove({ keyID });

  const charactersObj = await Keys.findOne({ keyID }).resultBody.characters;

  console.warn('before');
  const promises = Object.entries(charactersObj).map((character) => {
    console.log('character:', character[1]);
    return insertCharacter(keyID, character[0]);
  });

  console.warn('inbetween');
  const results = await Promise.all(promises);

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    console.log(`character #${i}: ${util.inspect(result, false, null)}`);
  }

  console.log('done displaying results');

  const primary = await detectPrimaryCharacter(keyID);
  // console.log('primary character: ' + primary);
  await setPrimaryCharacter(keyID, primary);
  // console.log('primary character saved in db');
};


Meteor.methods({
  addKeyCharacters: async (keyID) => {
    await addKeyCharacters(keyID);
  },
  setPrimaryCharacter: async (keyID, charName) => {
    await setPrimaryCharacter(keyID, charName);
  },
});
