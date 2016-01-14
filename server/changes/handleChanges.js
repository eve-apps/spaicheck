const jsonPatch = Meteor.npmRequire('fast-json-patch');

Meteor.methods({
  'handleChanges': function (keyID, err, result) {
    // Create array to hold all changes to key since last check
    let newChanges = [];

    // Build out the newChanges array
    if (err) {
      console.log(err); // Connection errors etc are logged to console and ignored
      if (err.error == 'INVALIDKEY') newChanges.push({changeType: err.error});
    }
    // All failed checks are iterated over and each represents a separate change
    else if (result.statusFlags[0] != 'GOOD') {
      for (flag of result.statusFlags) {
        newChanges.push({changeType: flag});
      }
    }
    // Handle changes that don't invalidate the key
    else {
      let oldRecord = Keys.findOne({keyID: keyID}).resultBody.characters;
      let newRecord = result.characters;
      let diff = jsonPatch.compare(oldRecord, newRecord);

      console.log(diff);
      // Iterate over the diff array, handling every possible change of importance to the corp
      diff.forEach(function (change, index) {
        // 'replace' ops can only logically happen inside a single character(#) object
        if (change.op == 'replace') {
          // RegEx to catch changes to corporationID or allianceID
          let charChangePattern = /\/(\d+)\/(corporationID|allianceID)/;
          // After test, charChangeTest will hold remembered values for characterID and changed field
          // exec() returns an array where first item is the matched string, all other items are remembered values
          let charChangeTest = charChangePattern.exec(diff[index].path);
          // Make sure that the test was successful and if so, pull out remembered values
          if (charChangeTest) {
            let curChangeType = '';
            let curCharID = charChangeTest[1];
            let curFieldName = charChangeTest[2];
            let oldValue = oldRecord[curCharID][curFieldName];
            let newValue = change.value;
            let npcCorpPattern = /1000(?:165|166|077|044|045|167|169|168|115|172|170|171)/;

            if (curFieldName == 'corporationID' && npcCorpPattern.test(newValue)) curChangeType = 'leaveCorp';
            else if (curFieldName == 'corporationID' && npcCorpPattern.test(oldValue)) curChangeType = 'joinCorp';
            else if (curFieldName == 'corporationID') curChangeType = 'switchCorp';
            else if (curFieldName == 'allianceID' && newValue == '0') curChangeType = 'leaveAlliance';
            else if (curFieldName == 'allianceID' && oldValue == '0') curChangeType = 'joinAlliance';
            else if (curFieldName == 'allianceID') curChangeType = 'switchAlliance';

            newChanges.push({
              changeType: curChangeType,
              oldValueStr: oldValue,
              newValueStr: newValue,
              context: {
                charID: curCharID,
                charName: oldRecord[curCharID].characterName,
                oldName: oldRecord[curCharID][curFieldName.replace('ID', 'Name')],
                newName: newRecord[curCharID][curFieldName.replace('ID', 'Name')]
              }
            });
          }
        }
        // 'add' and 'remove' ops can only logically happen at the 'characters' level
        else if (change.op == 'add' || change.op == 'remove') {
          // The following works very similarly to the "if" block above. Look there for more help.
          let charAddRemovePattern = /\/(\d+)/;
          let charAddRemoveTest = charAddRemovePattern.exec(diff[index].path);
          if (charAddRemoveTest && charAddRemoveTest[0]) {
            let curCharID = charAddRemoveTest[1];

            newChanges.push({
              changeType: change.op + "Character",
              // Depending on which type of operation, either 'old'('add' op) or 'new'('remove' op) will be undefined
              oldValueObj: oldRecord[curCharID],
              newValueObj: change.value
            });
          }
        }
      });
    }
    console.log(newChanges);
    if (newChanges.length != 0) {
      Changes.update(
        { keyID: keyID },
        {
          $set: {
            keyID: keyID,
          },
          $push: {
            log: {
              changes: newChanges,
              createdAt: new Date()
            }
          }
        },
        {
          upsert: true,
        }
      );
      Meteor.call('notifyChanges', keyID, newChanges.toString());
    }
  }
});
