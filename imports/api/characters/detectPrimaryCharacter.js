import { Meteor } from 'meteor/meteor';

import moment from 'moment';

import Characters from '/imports/api/characters/Characters';

const findOldestChar = (chars) => {
  let oldestStartDate = moment();
  let oldestChar = null;

  // For every character in the characters parameter
  chars.forEach((char) => {
    // Check the employment history to find the character
    // which was the first to join the corporation (TODO: change this.)
    Object.keys(char.employmentHistory).forEach((recordID) => {
      const record = char.employmentHistory[recordID];

      if (record.corporationID === Meteor.settings.public.corporationID) {
        if (oldestChar == null) {
          oldestChar = char;
        } else {
          const thisStartDate = moment(record.startDate);

          if (thisStartDate.isBefore(oldestStartDate)) {
            oldestStartDate = thisStartDate;
            oldestChar = char;
          }
        }
      }
    });
  });

  return oldestChar;
};

const filterInCorp = chars => chars.filter(char => char.corporationID === Meteor.settings.public.corporationID);
const filterInAlliance = chars => chars.filter(char => char.allianceID === Meteor.settings.public.allianceID);

const detectPrimaryCharacter = async (keyID) => {
  // detectPrimaryCharacter Body
  let charList = await Characters.find({ keyID }).fetch();

  console.log(`${charList.length} characters fetched from db`);
  let primaryChar = 'no character';
  if (!charList.length) {
    console.warn('Account has no characters!');
  } else {
    if (charList.length > 1) {
      let inCorpList = filterInCorp(charList);

      if (inCorpList.length > 1) {
        inCorpList = [findOldestChar(inCorpList)];
      }
      charList = inCorpList.length !== 0 ? inCorpList : charList;
    }

    if (charList.length > 1) {
      const inAllianceList = filterInAlliance(charList);
      charList = inAllianceList.length !== 0 ? inAllianceList : charList;
    }

    if (charList.length > 1) {
      charList.sort((a, b) => b.skillPoints - a.skillPoints);
    }
    primaryChar = charList[0].characterName;
  }

  return primaryChar;
};

export default detectPrimaryCharacter;
