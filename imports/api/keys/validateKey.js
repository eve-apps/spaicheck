import { Meteor } from 'meteor/meteor';

import _ from 'lodash';

import { eveFetch } from '/imports/server/eveFetch';

const validateKey = async (keyID, vCode) => {
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

export default validateKey;
