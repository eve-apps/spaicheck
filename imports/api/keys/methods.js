import { Meteor } from 'meteor/meteor';

import Keys from '/imports/api/keys/Keys';
import Characters from '/imports/api/characters/Characters';
import Changes from '/imports/api/changes/Changes';

import describeKey from '/imports/api/keys/describeKey';

import insertKey from './insertKey';
import bulkInsertKeys from './bulkInsertKeys';

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
    console.log(`Changes accepted for ${describeKey(Keys.findOne({ keyID }))}`);

    const query = {
      keyID,
      log: {
        $elemMatch: {
          reviewed: false,
        },
      },
    };

    // Thanks to http://stackoverflow.com/a/34887428/1233003
    while (Changes.find(query).count() > 0) {
      Changes.update(
        // Query
        query,
        // Update
        {
          $set: {
            'log.$.reviewed': true,
          },
        }
      );
    }
  },
});
