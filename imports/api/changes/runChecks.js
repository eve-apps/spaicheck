import { Meteor } from 'meteor/meteor';
import Keys from '/imports/api/keys/Keys';

import { validateKey } from '/imports/api/keys/methods';
import handleChanges from './handleChanges';

const runChecks = async () => {
  console.log('Updating keys...');
  // Fetch all keys from the database and validate them
  const curKeys = Keys.find({}).fetch();
  let curTimeout = 0;

  if (curKeys.length) {
    console.log(`Checking ${curKeys.length} keys...`);
  } else {
    console.log('No keys to check.');
  }
  for (let i = 0; i < curKeys.length; i++) {
    // Limit calls to 30 per second by staggering them by 1 30th of a second
    Meteor.setTimeout(async () => {
      const fnStart = new Date();

      if (curKeys[i].status === 'ERROR') {
        try {
          const result = await validateKey(curKeys[i].keyID, curKeys[i].vCode);

          Keys.update({ keyID: curKeys[i].keyID }, {
            $set: {
              resultBody: result,
              status: 'GOOD',
            },
          });
        } catch (err) {
          throw err;
        }
      } else {
        console.log('current key:', curKeys[i]);
        try {
          const result = await validateKey(curKeys[i].keyID, curKeys[i].vCode);
          // FIXME: If handleChanges errors, handleChanges will be run again below
          await handleChanges(curKeys[i].keyID, undefined, result);
        } catch (err) {
          await handleChanges(curKeys[i].keyID, err, undefined);
        }
        const fnEnd = new Date();
        const fnDelta = fnEnd - fnStart;
        console.log(`Check for key #${curKeys[i].keyID} finished in ${fnDelta}ms`);
      }
    }, curTimeout += Math.ceil(1000 / 30));

    console.log(`Will check key #${curKeys[i].keyID} after ${curTimeout}ms...`);
  }
};

export default runChecks;
