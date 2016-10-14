import { Meteor } from 'meteor/meteor';
import _ from 'lodash';

import { eveFetch } from '/imports/server/eveFetch';

import Keys from '/imports/api/keys/Keys';
import Characters from '/imports/api/characters/Characters';
import Changes from '/imports/api/changes/Changes';

Meteor.startup(() => {
  // Run initial startup check on all Keys
  Meteor.call('runChecks');
  // Run validation checks on all keys every 6 minutes
  Meteor.setInterval(() => {
    Meteor.call('runChecks');
  }, 360000);
});

export const validateKey = async (keyID, vCode) => {
  let result;
  try {
    result = await eveFetch('account:APIKeyInfo', { keyID, vCode });
  } catch (err) {
    // Handle API errors here
    if (err.code) {
      switch (err.code) {
        case '203':
          err.error = 'MALFORMEDKEY';
          break;
        case '222':
          err.error = 'INVALIDKEY';
          break;
        default:
          err.error = 'UNHANDLED';
      }
    } else if (err.response) err.error = 'CONNERR';
    else err.error = 'INTERNAL';

    throw new Meteor.Error(err.error);
  }

  const statusFlags = [];

  // Handle specific corporation requirements here
  if (result.type === 'Character') statusFlags.push('SINGLECHAR');
  if (result.type === 'Corporation') statusFlags.push('CORPKEY');
  if (!(result.accessMask === '1073741823' || result.accessMask === '4294967295')) statusFlags.push('BADMASK');
  if (result.expires !== '') statusFlags.push('EXPIRES');

  if (statusFlags.length) throw new Meteor.Error(statusFlags.join(', '));

  // No checks have failed at this point, the key is sufficient to join the corporation.
  // Prepare the key info for insertion in the db

  // Remove the 'factionID' and 'factionName' properties from the characters in the API result
  const characters = {};
  _.forOwn(result.characters, (character, characterID) => {
    characters[characterID] = _.omit(character, ['factionID', 'factionName']);
  });
  result.characters = characters;

  // If no error was produced, return the result because the API key exists
  return result;
};

const keyIsDuplicate = async (keyData) => {
  // TODO: Should only have to do a single query to determine this
  // TODO: Maybe disable consistent-return rule
  // eslint-disable-next-line consistent-return
  if (keyData == null) console.error('keyData is null!');
  const charIDs = Object.keys(keyData.characters);
  for (let i = 0; i < charIDs.length; i++) {
    if (await Characters.findOne({ characterID: Number(charIDs[i]) })) {
      return true;
    }
  }
  return false;
};

const insertKey = async (doc) => {
  let result;
  try {
    result = await validateKey(doc.keyID, doc.vCode);
  } catch (err) {
    console.log(`validateKey result: keyID ${doc.keyID}, vCode ${doc.vCode}`, err);
    Meteor.call('logKeyError', doc.keyID, doc.vCode, err);
    return false;
  }

  if (await keyIsDuplicate(result)) {
    Meteor.call('logKeyError', doc.keyID, doc.vCode, { error: 'EXISTINGKEY' });
    return false;
  }

  console.log(`validateKey result: keyID ${doc.keyID}, vCode ${doc.vCode}`, result);


  const modifiedDoc = _.cloneDeep(doc);
  modifiedDoc.resultBody = result;
  // FIXME: This log seems to run after some of the logs in the addKeyCharacters method,
  // even though it is called first. What's going on here?
  console.log(`--- inserting key with keyID ${modifiedDoc.keyID} into db ---`);
  Keys.insert(modifiedDoc, { removeEmptyStrings: false });
  Meteor.call('addKeyCharacters', modifiedDoc.keyID);

  return true;
};


Meteor.methods({
  // Wrapped to run synchronously using meteorhacks:npm's Async package
  validateKey: async (keyID, vCode) => await validateKey(keyID, vCode),

  insertKey: async doc => await insertKey(doc),

  insertKeysBulk: (csvData) => {
    const lines = csvData.split('\n');
    lines.shift(); // Discard the column headers, we make our own

    const keyObjs = lines.map((line) => {
      const keyPair = line.split(',');

      return {
        keyID: keyPair[0],
        vCode: keyPair[1],
      };
    });

    let curTimeout = 0;

    keyObjs.forEach((keyObj) => {
      // Limit calls to 30 per second by staggering them by 1 30th of a second
      Meteor.setTimeout(() => {
        Meteor.call('insertKey', keyObj);
      // }, curTimeout += Math.ceil(1000/30));
      }, curTimeout += Math.ceil(1000 / 5));
    });
  },

  removeKey: (keyID) => {
    Changes.remove({ keyID });
    Characters.remove({ keyID });
    Keys.remove({ keyID });
  },

  acceptChanges: (keyID) => {
    console.log(`acceptChanges for ${keyID}`);
    Changes.remove({ keyID });
  },
});
