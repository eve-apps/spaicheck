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
      for (let change in diff) {
        // 'replace' ops can only logically happen inside a single character(#) object
        if (change.op == 'replace') {

        }
      }
    }
    if (newChanges.length != 0) Meteor.call('notifyChanges', keyID, newChanges.toString());
  }
});
