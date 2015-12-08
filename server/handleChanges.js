Meteor.methods({
  'handleChanges': function (keyID, err, result) {
    console.log(keyID);
    // if (err) {
    //   if (err.code) {
    //     switch (err.code) {
    //       case '222':
    //         return 'Key has expired or has been deleted'
    //     }
    //   }
    // }
  }
});
