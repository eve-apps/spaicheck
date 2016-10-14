import Keys from '/imports/api/keys/Keys';

const setPrimaryCharacter = async (keyID, charName) => {
  await Keys.update(
    { keyID },
    {
      $set: {
        primaryChar: charName,
      },
    }
  );
  console.log(`Primary character for key #${keyID} has been set to ${charName}.`);
};

export default setPrimaryCharacter;
