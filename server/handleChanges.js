const jsonPatch = Meteor.npmRequire('fast-json-patch');

Meteor.methods({
  'handleChanges': function (keyID, err, result) {
    if (err) {
      console.log(err);
      if (err.error == 'INVALIDKEY') {
        Meteor.call('notifyChanges', keyID, err.reason);
        //TODO: remove key from DB
      }
    }
    else if (result.statusFlags[0] != 'GOOD') {
      Meteor.call('notifyChanges', keyID, 'Key no longer passes corporation checks - ' + result.statusFlags);
      //TODO: remove key from DB
    }
    else {
      let oldRecord = Keys.findOne({keyID: keyID}).resultBody;
      let newRecord = _.omit(result, ['currentTime', 'cachedUntil', 'statusFlags']);
      let diff = jsonPatch.compare(oldRecord, newRecord);

      if (diff.length == 0) return 0;
      Meteor.call('notifyChanges', keyID, diff);
      //TODO: decide whether to remove key from DB
    }
  }
});
