import Errors from '/imports/api/errors/Errors';

import getErrorDescription from './getErrorDescription';

const logKeyErrors = (keyID, vCode, error) => {
  // Handle failed corp checks, which need to be logged as separate errors

  const errors = (error.error.indexOf(', ') > -1) ? error.error.split(', ') : [error.error];

  errors.forEach((singleError) => {
    const reason = getErrorDescription(singleError);

    Errors.update(
      { keyID },
      {
        $setOnInsert: {
          // keyID: keyID,
          vCode,
        },
        $addToSet: {
          log: {
            error: singleError,
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
    console.log(`[${singleError}] ${reason}`);
  });
};

export default logKeyErrors;
