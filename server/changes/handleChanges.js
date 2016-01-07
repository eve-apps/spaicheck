const jsonPatch = Meteor.npmRequire('fast-json-patch');

Meteor.methods({
  'handleChanges': function (keyID, err, result) {
    // Create array to hold all changes to key since last check
    let newChanges = [];

    // Build out the newChanges array
    if (err) {
      console.log(err); // Connection errors etc are logged to console and ignored
      if (err.error == 'INVALIDKEY') newChanges.push({type: 'validity'});
    }
    // All failed checks are stored together, to be iterated over in the displayTemplate
    else if (result.statusFlags[0] != 'GOOD') newChanges.push({type: 'corpChecks', data: result.statusFlags});
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
          if (charChangeTest && charChangeTest[0]) {
            let curCharID = charChangeTest[1];
            let curFieldName = charChangeTest[2];
            // Console log newChanges to get an idea for how it works
            newChanges.push({
              type: curFieldName,
              data: {
                old: oldRecord[curCharID][curFieldName],
                new: change.value
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
              type: change.op + "Character",
              // Depending on which type of operation, either 'old'('add' op) or 'new'('remove' op) will be undefined
              data: {
                old: oldRecord[curCharID],
                new: change.value
              }
            });
          }
        }
      });
    }
    console.log(newChanges);
    if (newChanges.length != 0) Meteor.call('notifyChanges', keyID, newChanges.toString());
  }
});
