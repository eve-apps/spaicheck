import { Meteor } from 'meteor/meteor';

import Keys from '/imports/api/keys/Keys';
import Characters from '/imports/api/characters/Characters';
import Changes from '/imports/api/changes/Changes';

import runChecks from '/imports/api/changes/runChecks';
import insertKey from './insertKey';
import bulkInsertKeys from './bulkInsertKeys';


Meteor.startup(async () => {
  // Run initial startup check on all Keys
  await runChecks();
  // Run validation checks on all keys every 6 minutes
  Meteor.setInterval(async () => {
    await runChecks();
  }, 360000);
});


Meteor.methods({
  insertKey: async doc => await insertKey(doc),

  bulkInsertKeys: async (csvData) => { await bulkInsertKeys(csvData); },

  removeKey: (keyID) => {
    Changes.remove({ keyID });
    Characters.remove({ keyID });
    Keys.remove({ keyID });
  },

  acceptChanges: (keyID) => {
    // TODO: Log this better. This is a security concern if unauthorized users manage to do this.
    console.log(`Changes accepted for ${keyID}`);
    Changes.remove({ keyID });
  },
});
