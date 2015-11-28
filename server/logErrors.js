Meteor.methods({
  'logKeyError': function (keyID, vCode, errorType, message) {
    Errors.update(
      { keyID: keyID },
      {
        $set: {
          keyID: keyID,
          vCode: vCode
        },
        $addToSet: {
          log: {
            errorType: errorType,
            message: message
          }
        }
      },
      {
        upsert: true,
        validate: false
      });
    console.log("Key " + keyID + " with vCode " + vCode + " threw the following error:");
    console.log("[" + errorType + "] " + message);
  }
});