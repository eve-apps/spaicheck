const jsonPatch = Meteor.npmRequire('fast-json-patch');

Meteor.methods({
  'handleChanges': function (keyID, err, result) {
    if (!err || err.error == 'INVALIDKEY') {
      let oldRecord = Keys.findOne({keyID: keyID}).resultBody;
      if (err && err.error == 'INVALIDKEY') {
        Meteor.call('notifyChanges', keyID, oldRecord, err.reason);
        //TODO: remove key from DB
      } else if (result.statusFlags[0] != 'GOOD') {
        Meteor.call('notifyChanges', keyID, oldRecord, result.statusFlags);
        //TODO: remove key from DB
      }
      else {
        let newRecord = _.omit(result, ['currentTime', 'cachedUntil', 'statusFlags']);
        let diff = jsonPatch.compare(oldRecord, newRecord);

        if (diff.length == 0) return 0;
        Meteor.call('notifyChanges', keyID, oldRecord, diff);
        //TODO: decide whether to remove key from DB
      }
    } else {
      console.log(err);
    }
  }
});
