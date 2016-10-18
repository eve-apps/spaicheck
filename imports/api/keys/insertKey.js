import _ from 'lodash';

import Keys from '/imports/api/keys/Keys';

import logKeyErrors from '/imports/api/errors/logKeyErrors';
import addKeyCharacters from '/imports/api/characters/addKeyCharacters';

import keyIsDuplicate from './keyIsDuplicate';
import validateKey from './validateKey';

const insertKey = async (doc) => {
  const { result, ...error } = await validateKey(doc.keyID, doc.vCode);
  if (result) {
    if (await keyIsDuplicate(result)) {
      await logKeyErrors(doc.keyID, doc.vCode, { type: 'EXISTINGKEY' });
      return false;
    }

    console.log(`validateKey result: keyID ${doc.keyID}, vCode ${doc.vCode}`, result);


    const modifiedDoc = _.cloneDeep(doc);
    modifiedDoc.resultBody = result;
    console.log(`--- inserting key with keyID ${modifiedDoc.keyID} into db ---`);
    Keys.insert(modifiedDoc, { removeEmptyStrings: false });
    await addKeyCharacters(modifiedDoc.keyID);
    return true;
  }

  // API error or corp requirement failed
  await logKeyErrors(doc.keyID, doc.vCode, error);
  return false;
};

export default insertKey;
