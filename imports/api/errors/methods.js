import { Meteor } from 'meteor/meteor';

import Errors from '/imports/api/errors/Errors';

Meteor.methods({
  splitErrors: (keyID, vCode, error) => {
    for (const singleError of error.error.split(', ')) {
      Meteor.call('logKeyError', keyID, vCode, { error: singleError });
    }
  },
  logKeyError: (keyID, vCode, error) => {
    let reason = '';

    // Handle failed corp checks, which need to be logged as separate errors
    console.log(error);
    if (error.error.indexOf(', ') > -1) {
      Meteor.call('splitErrors', keyID, vCode, error);
      return; // Break out because splitErrors() will rerun logKeyError()
    }

    switch (error.error) {
      case 'INTERNAL':
        reason = 'Internal error.';
        break;
      case 'CONNERR':
        reason = 'Connection error.';
        break;
      case 'EXISTINGKEY':
        reason = 'This or another key already exists for this player.';
        break;
      case 'INVALIDKEY':
        reason = 'Key has expired or been deleted.';
        break;
      case 'MALFORMEDKEY':
        reason = 'KeyID and/or vCode is invalid.';
        break;
      case 'BADMASK':
        reason = 'Key doesn\'t provide correct access rights.';
        break;
      case 'SINGLECHAR':
        reason = 'Key only provides info about a single character.';
        break;
      case 'CORPKEY':
        reason = 'Key is a corporation key, not a player key.';
        break;
      case 'EXPIRES':
        reason = 'Key is set to expire.';
        break;
      case 'UNHANDLED':
        reason = `Unhandled API error code ${error.errCode}.`;
        break;
      default:
        reason = 'Unknown error type.';
    }

    Errors.update(
      { keyID },
      {
        $setOnInsert: {
          // keyID: keyID,
          vCode,
        },
        $addToSet: {
          log: {
            error: error.error,
            reason,
          },
        },
      },
      {
        upsert: true,
        validate: false,
      }
    );

    Errors.update(
      { keyID },
      {
        $push: {
          log: {
            $each: [],
            $slice: -6,
          },
        },
      }
    );

    console.log(`Key ${keyID} with vCode ${vCode} threw the following error:`);
    console.log(`[${error.error}] ${reason}`);
  },
  discardError: (errorId) => {
    Errors.remove(errorId);
  },
});
