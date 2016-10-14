import { Meteor } from 'meteor/meteor';

import addKeyCharacters from './addKeyCharacters';
import setPrimaryCharacter from './setPrimaryCharacter';

Meteor.methods({
  addKeyCharacters: async (keyID) => {
    await addKeyCharacters(keyID);
  },
  setPrimaryCharacter: async (keyID, charName) => {
    await setPrimaryCharacter(keyID, charName);
  },
});
