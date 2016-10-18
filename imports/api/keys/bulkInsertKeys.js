import { Meteor } from 'meteor/meteor';
import insertKey from './insertKey';

const bulkInsertKeys = (csvData) => {
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
    Meteor.setTimeout(async () => {
      await insertKey(keyObj);
    // }, curTimeout += Math.ceil(1000/30));
    }, curTimeout += Math.ceil(1000 / 5));
  });
};

export default bulkInsertKeys;
