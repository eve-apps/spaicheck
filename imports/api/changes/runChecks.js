import { Meteor } from 'meteor/meteor';
import Keys from '/imports/api/keys/Keys';

import humanize from 'humanize-plus';
import describeKey from '/imports/api/keys/describeKey';

import checkKey from './checkKey';

const runChecks = async () => {
  // Fetch all keys from the database and validate them
  const curKeys = Keys.find({}).fetch();
  let curTimeout = 0;

  if (curKeys.length) {
    console.log(`Checking ${curKeys.length} ${humanize.pluralize(curKeys.length, 'key')}...`);
  } else {
    console.log('No keys to check.');
  }

  curKeys.forEach((key) => {
    // Limit calls to 30 per second by staggering them by 1 30th of a second
    Meteor.setTimeout(() => checkKey(key), curTimeout += Math.ceil(1000 / 30));

    console.log(`Will check ${describeKey(key)} after ${curTimeout}ms...`);
  });
};

export default runChecks;
