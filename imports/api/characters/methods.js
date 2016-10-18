import { Meteor } from 'meteor/meteor';

import setPrimaryCharacter from './setPrimaryCharacter';

Meteor.methods({
  setPrimaryCharacter: async (keyID, charName) => {
    await setPrimaryCharacter(keyID, charName);
  },
});
