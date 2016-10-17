import Keys from '/imports/api/keys/Keys';

import validateKey from '/imports/api/keys/validateKey';
import describeKey from '/imports/api/keys/describeKey';
import handleChanges from './handleChanges';

// Sets the status of a key to GOOD
const markGood = async (keyID, resultBody) => {
  await Keys.update({ keyID }, {
    $set: {
      resultBody,
      status: 'GOOD',
    },
  });
};

const checkKey = async (key) => {
  try {
    const fnStart = new Date();

    console.log(`Checking ${describeKey(key)}...`);

    const { result, ...error } = await validateKey(key.keyID, key.vCode);
    if (result) {
      if (key.status === 'ERROR') await markGood(key.keyID, result);

      await handleChanges(key.keyID, null, result);
    } else {
      await handleChanges(key.keyID, error, null);
    }
    const fnEnd = new Date();
    const fnDelta = fnEnd - fnStart;
    console.log(`Check for ${describeKey(key)} finished in ${fnDelta}ms`);
  } catch (err) {
    console.error(`Error in checkKey: ${err.stack}`);
  }
};

export default checkKey;
