import Keys from '/imports/api/keys/Keys';
import Characters from '/imports/api/characters/Characters';

import insertCharacter from './insertCharacter';
import detectPrimaryCharacter from './detectPrimaryCharacter';
import setPrimaryCharacter from './setPrimaryCharacter';

const addKeyCharacters = async (keyID) => {
  // Remove old characters
  await Characters.remove({ keyID });

  // Retrieve the list of characters from the key in db
  const charactersObj = await Keys.findOne({ keyID }).resultBody.characters;

  // Insert the characters into the db in parallel
  const promises = Object.entries(charactersObj).map((character) => {
    console.log('character:', character[1]);
    return insertCharacter(keyID, character[0]);
  });

  // Wait for all the characters to be inserted
  const results = await Promise.all(promises);

  // Log the results of the character insertions (TODO: Remove this)
  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    console.log(`character #${i}: ${result}`);
  }

  // Detect the primary character for the key
  const primary = await detectPrimaryCharacter(keyID);
  // Set the primary character in the db
  await setPrimaryCharacter(keyID, primary);
};

export default addKeyCharacters;
