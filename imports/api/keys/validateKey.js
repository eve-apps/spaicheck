import _ from 'lodash';

import { eveFetch } from '/imports/server/eveFetch';

const validateKey = async (keyID, vCode) => {
  let result;
  try {
    result = await eveFetch('account:APIKeyInfo', { keyID, vCode });
  } catch (err) {
    // FIXME: I don't think err.code is ever defined, which causes MALFORMEDKEY, etc. to be reported as CONNERR
    // Handle API errors here
    let apiError;
    if (err.code) {
      switch (err.code) {
        case '203':
          apiError = 'MALFORMEDKEY';
          break;
        case '222':
          apiError = 'INVALIDKEY';
          break;
        default:
          apiError = 'UNHANDLED';
      }
    } else if (err.response) apiError = 'CONNERR';
    else apiError = 'INTERNAL';

    return { apiError, apiErrorCode: err.code };
  }

  const statusFlags = [];

  // Handle specific corporation requirements here
  if (result.type === 'Character') statusFlags.push('SINGLECHAR');
  if (result.type === 'Corporation') statusFlags.push('CORPKEY');
  if (!(result.accessMask === '1073741823' ||
    result.accessMask === '4294967295')) statusFlags.push('BADMASK');
  if (result.expires !== '') statusFlags.push('EXPIRES');

  if (statusFlags.length) return { flags: statusFlags };

  // No checks have failed at this point, the key is sufficient to join the corporation.
  // Prepare the key info for insertion in the db

  // Remove the 'factionID' and 'factionName' properties from the characters in the API result
  const characters = {};
  _.forOwn(result.characters, (character, characterID) => {
    characters[characterID] = _.omit(character, ['factionID', 'factionName']);
  });
  result.characters = characters;

  // If no error was produced, return the result because the API key exists
  return { result };
};

export default validateKey;
