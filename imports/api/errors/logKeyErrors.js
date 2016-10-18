import Errors from '/imports/api/errors/Errors';
import humanize from 'humanize-plus';
import chalk from 'chalk';

import { capVCode } from '/imports/shared/vCodeHelpers';

import getIssueDesc from '/imports/shared/getIssueDescription';

chalk.enabled = true;


const logKeyError = (keyID, vCode, type, data) => {
  const desc = getIssueDesc(type, true, data || {});

  Errors.update(
    { keyID },
    {
      $setOnInsert: {
        // keyID: keyID,
        vCode,
      },
      $addToSet: {
        log: {
          error: type,
          reason: desc,
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

  console.log(chalk.yellow(`- [${type}] ${desc}`));
};

const printIssueHeader = (keyID, vCode, numIssues) => {
  console.log(`Key ${keyID} with vCode ${capVCode(vCode)} has ${chalk.yellow(numIssues)} ${chalk.yellow(humanize.pluralize(numIssues, 'issue'))}:`);
};

const logKeyErrors = (keyID, vCode, error) => {
  // Handle failed corp checks, which need to be logged as separate errors

  if (error.apiError) {
    printIssueHeader(keyID, vCode, 1);
    logKeyError(keyID, vCode, error.apiError, { apiErrorCode: error.apiErrorCode });
  } else if (error.flags) {
    printIssueHeader(keyID, vCode, error.flags.length);
    error.flags.forEach(flag =>
      logKeyError(keyID, vCode, flag.type, flag.data)
    );
  } else {
    // EXISTINGKEY
    printIssueHeader(keyID, vCode, 1);
    logKeyError(keyID, vCode, error.type);
  }
};

export default logKeyErrors;
