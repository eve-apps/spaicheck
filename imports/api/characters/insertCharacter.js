import { eveFetch } from '/imports/server/eveFetch';

import Keys from '/imports/api/keys/Keys';
import Characters from '/imports/api/characters/Characters';

const insertCharacter = async (keyID, charID) => {
  const vCode = await Keys.findOne({ keyID }).vCode;

  console.log('>>>about to fetch from api');
  try {
    const characterInfo = await eveFetch('eve:CharacterInfo', { keyID, vCode, characterID: charID });
    console.log('>>>fetched from api');

    if (characterInfo && !(await Characters.findOne({ characterID: characterInfo.characterID }))) {
      console.log('characterInfo is here');
      characterInfo.keyID = keyID;
      await Characters.insert(characterInfo);
      return characterInfo.characterName;
    }

    console.log('will not insert character');
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default insertCharacter;
