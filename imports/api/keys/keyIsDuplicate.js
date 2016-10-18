import Characters from '/imports/api/characters/Characters';

const keyIsDuplicate = async (keyData) => {
  // TODO: Should only have to do a single query to determine this
  // TODO: Maybe disable consistent-return rule
  // eslint-disable-next-line consistent-return
  if (keyData == null) console.error('keyData is null!');
  const charIDs = Object.keys(keyData.characters);
  for (let i = 0; i < charIDs.length; i++) {
    if (await Characters.findOne({ characterID: Number(charIDs[i]) })) {
      return true;
    }
  }
  return false;
};

export default keyIsDuplicate;
