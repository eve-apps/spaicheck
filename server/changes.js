const jsonPatch = Meteor.npmRequire('fast-json-patch');

Meteor.methods({
  'runChecks': function () {
    console.log("Updating keys...");
    // Fetch all keys from the database and validate them
    let curKeys = Keys.find({status: {$in: ['GOOD', 'WARNING']}}).fetch(); // all currently valid keys
    let curTimeout = 0;
    var cachedUntil = null;

    for (let i=0; i < curKeys.length; i++) {
      // Limit calls to 30 per second by staggering them by 1 30th of a second
      Meteor.setTimeout(function () {
        let fnStart = new Date();

        Meteor.call('validateKey', curKeys[i].keyID, curKeys[i].vCode, function (err, result) {
          Meteor.call('handleChanges', curKeys[i].keyID, err, result);
          let fnEnd = new Date();
          let fnDelta = fnEnd - fnStart;
          console.log("Call #" + i + " has returned in " + fnDelta + " milliseconds. ");
        });
      }, curTimeout += Math.ceil(1000/30));

      console.log("Key #" + i + " set to run in " + curTimeout + " milliseconds.");
    }
  },

  'handleChanges': function (keyID, err, result) {
    // Create array to hold all changes to key since last check
    const ignoredErrors = ['CONNERR', 'INTERNAL'];
    let newChanges = [];

    // Build out the newChanges array
    if (err) {
      // Push the error, unless it's on the ignoredErrors list
      if (ignoredErrors.indexOf(err.error) > -1) console.log(err); // Connection errors etc are logged to console and ignored
      // Handle corporation check failures; all failed checks are iterated over and each represents a separate change
      else if (err.error.indexOf(',') > -1) {
        for (flag of err.error.split(', ')) {
          newChanges.push({changeType: flag, severity: 'ERROR'});
        }
      }
      else {
        newChanges.push({changeType: err.error, severity: 'ERROR'});
      }
    }
    // Handle changes that don't invalidate the key
    else {
      let oldRecord = Keys.findOne({keyID: keyID}).resultBody.characters;
      let newRecord = result.characters;
      let diff = jsonPatch.compare(oldRecord, newRecord);

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
              severity: 'WARNING',
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
              newValueObj: change.value,
              severity: 'WARNING'
            });
          }
        }
      });

      if (diff.length != 0) {
        Keys.update(Keys.findOne({keyID: keyID})._id, {
          $set: {
            'resultBody.characters': result.characters,
          }
        });
      }
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

      let highestSeverity = 'WARNING';
      for(i = 0; i < newChanges.length; i++) {
        let change = newChanges[i];
        if (change.severity == 'ERROR') {
          highestSeverity = change.severity;
          break;
        }
      }

      Keys.update(Keys.findOne({keyID: keyID})._id, {
        $set: {
          status: highestSeverity
        }
      });

      const affectedChar = Keys.findOne({"keyID": keyID}).primaryChar;
      const divider = '\n______________________________\n';
      const softDivider = '\n------------------------------\n';

      let content = '';
      let data = '';

      for (change of newChanges) {
        let valueObj = change.newValueObj || change.oldValueObj;
        for (fieldName in valueObj) {
          switch (fieldName) {
            case 'characterName':
              data += `${fieldName}: ${valueObj[fieldName]} <a href="https://zkillboard.com/character/${valueObj.characterID}/">[zKillboard]</a> <a href="http://evewho.com/pilot/${valueObj.characterName.replace(/ /g, '+')}/">[EveWho]</a>\n`
              break;
            case 'corporationName':
              data += `${fieldName}: ${valueObj[fieldName]} <a href="https://zkillboard.com/corporation/${valueObj.corporationID}/">[zKillboard]</a> <a href="http://evewho.com/corp/${valueObj.corporationName.replace(/ /g, '+')}/">[EveWho]</a>\n`
              break;
            case 'allianceName':
              data += valueObj.allianceID !== '0' ? `${fieldName}: ${valueObj[fieldName]} <a href="https://zkillboard.com/alliance/${valueObj.allianceID}/">[zKillboard]</a> <a href="http://evewho.com/alli/${valueObj.allianceName.replace(/ /g, '+')}/">[EveWho]</a>\n` : `${fieldName}: \n`
              break;
            default:
              data += `${fieldName}: ${valueObj[fieldName]}\n`
          }
        }

        content += `${divider}Change Type: ${change.changeType}${softDivider}${data}`;
        data = '';
      }

      content = content.replace(/\n/g, '<br>');

      Meteor.call('notifyChanges', affectedChar, `Affected Character: ${affectedChar}\n${content}`);
    }
  },

  'notifyChanges': function (charName, changes) {
    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: Meteor.settings.private.mailTo,
      from: "changes@spaicheck.com",
      subject: "Key for " + charName + " has changed",
      html: changes
    });
  }
});
