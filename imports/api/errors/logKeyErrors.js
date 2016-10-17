import Errors from '/imports/api/errors/Errors';
import humanize from 'humanize-plus';
import chalk from 'chalk';

import { capVCode } from '/imports/shared/vCodeHelpers';

import getIssueDesc from '/imports/shared/getIssueDescription';

chalk.enabled = true;

const logKeyErrors = (keyID, vCode, errors) => {
  // Handle failed corp checks, which need to be logged as separate errors

  console.log(`Key ${keyID} with vCode ${capVCode(vCode)} has ${chalk.yellow(errors.length)} ${chalk.yellow(humanize.pluralize(errors.length, 'issue'))}:`);
  errors.forEach((error) => {
    const reason = getIssueDesc(error, true);

    Errors.update(
      { keyID },
      {
        $setOnInsert: {
          // keyID: keyID,
          vCode,
        },
        $addToSet: {
          log: {
            error,
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

    console.log(chalk.yellow(`- [${error}] ${reason}`));
  });
};

export default logKeyErrors;
