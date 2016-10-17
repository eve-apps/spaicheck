import _ from 'lodash';
import jsonPatch from 'fast-json-patch';

import Keys from '/imports/api/keys/Keys';
import Changes from '/imports/api/changes/Changes';

import ChangeEmailNotification from '/imports/api/notifications/ChangeEmailNotification';

import addKeyCharacters from '/imports/api/characters/addKeyCharacters';

const getLastChanges = async (keyID) => {
  const c = await Changes.findOne({ keyID });
  if (c == null || !c.log.length) return [];
  return c.log[c.log.length - 1].changes;
};

// TODO: Break this up further
const handleChanges = async (keyID, error, result) => {
  // Create array to hold all changes to key since last check
  const ignoredErrors = ['CONNERR', 'INTERNAL'];
  const newChanges = [];

  // Build out the newChanges array
  if (error) {
    const lastChanges = await getLastChanges(keyID);
    if (error.apiError) {
      // TODO: Give feedback to user for ignored errors
      // Connection errors etc are logged to console and ignored
      // Push the error if it's not on the ignoredErrors list
      if (!(ignoredErrors.indexOf(error.apiError) > -1)) {
        const newChange = { changeType: error.apiError, severity: 'ERROR' };
        // Push the change if it's new
        if (!_.some(lastChanges, newChange)) {
          newChanges.push(newChange);
        }
      } else if (error.code != null) {
        // MALFORMEDKEY, INVALIDKEY, or UNHANDLED
        console.log(`${error.code}: ${error.apiError} APIERROR`);
      } else {
        // INTERNAL or CONNERR
        console.warn(`${error.apiError} APIERROR`);
      }
    } else {
      // Handle corporation check failures; all failed checks are iterated over and each represents a separate change
      error.flags.forEach((flag) => {
        const newChange = { changeType: flag, severity: 'ERROR' };
        // Push the change if it's new
        if (!_.some(lastChanges, newChange)) {
          newChanges.push(newChange);
        }
      });
    }
  } else {
    // Handle changes that don't invalidate the key
    const oldRecord = Keys.findOne({ keyID }).resultBody.characters;
    const newRecord = result.characters;
    if (keyID == null) {
      console.error('keyID is null in handleChanges');
    }
    if (result == null) {
      console.error('result is null in handleChanges');
    }
    const diff = jsonPatch.compare(oldRecord, newRecord);

    // Iterate over the diff array, handling every possible change of importance to the corp
    diff.forEach((change, index) => {
      // 'replace' ops can only logically happen inside a single character(#) object
      if (change.op === 'replace') {
        // RegEx to catch changes to corporationID or allianceID
        const charChangePattern = /\/(\d+)\/(corporationID|allianceID)/;
        // After test, charChangeTest will hold remembered values for characterID and changed field
        // exec() returns an array where first item is the matched string, all other items are remembered values
        const charChangeTest = charChangePattern.exec(diff[index].path);
        // Make sure that the test was successful and if so, pull out remembered values
        if (charChangeTest) {
          let curChangeType = '';
          const curCharID = charChangeTest[1];
          const curFieldName = charChangeTest[2];
          const oldValue = oldRecord[curCharID][curFieldName];
          const newValue = change.value;
          const npcCorpPattern = /1000(?:165|166|077|044|045|167|169|168|115|172|170|171)/;

          if (curFieldName === 'corporationID' && npcCorpPattern.test(newValue)) curChangeType = 'leaveCorp';
          else if (curFieldName === 'corporationID' && npcCorpPattern.test(oldValue)) curChangeType = 'joinCorp';
          else if (curFieldName === 'corporationID') curChangeType = 'switchCorp';
          else if (curFieldName === 'allianceID' && newValue === '0') curChangeType = 'leaveAlliance';
          else if (curFieldName === 'allianceID' && oldValue === '0') curChangeType = 'joinAlliance';
          else if (curFieldName === 'allianceID') curChangeType = 'switchAlliance';

          newChanges.push({
            changeType: curChangeType,
            oldValueStr: oldValue,
            newValueStr: newValue,
            severity: 'WARNING',
            context: {
              charID: curCharID,
              charName: oldRecord[curCharID].characterName,
              oldName: oldRecord[curCharID][curFieldName.replace('ID', 'Name')],
              newName: newRecord[curCharID][curFieldName.replace('ID', 'Name')],
            },
          });
        }
      } else if (change.op === 'add' || change.op === 'remove') {
        // 'add' and 'remove' ops can only logically happen at the 'characters' level
        // The following works very similarly to the "if" block above. Look there for more help.
        const charAddRemovePattern = /\/(\d+)/;
        const charAddRemoveTest = charAddRemovePattern.exec(diff[index].path);
        if (charAddRemoveTest && charAddRemoveTest[0]) {
          const curCharID = charAddRemoveTest[1];

          newChanges.push({
            changeType: `${change.op}Character`,
            // Depending on which type of operation, either 'old'('add' op) or 'new'('remove' op) will be undefined
            oldValueObj: oldRecord[curCharID],
            newValueObj: change.value,
            severity: 'WARNING',
          });
        }
      }
    });

    if (diff.length !== 0) {
      Keys.update(Keys.findOne({ keyID })._id, {
        $set: {
          'resultBody.characters': result.characters,
        },
      });

      await addKeyCharacters(keyID);
    }
  }
  if (newChanges.length) {
    console.log('New changes:', newChanges);

    Changes.update(
      { keyID },
      {
        $set: {
          keyID,
        },
        $push: {
          log: {
            changes: newChanges,
            createdAt: new Date(),
          },
        },
      },
      {
        upsert: true,
      }
    );

    let highestSeverity = 'WARNING';
    for (let i = 0; i < newChanges.length; i++) {
      const change = newChanges[i];
      if (change.severity === 'ERROR') {
        highestSeverity = change.severity;
        break;
      }
    }

    Keys.update(Keys.findOne({ keyID })._id, {
      $set: {
        status: highestSeverity,
      },
    });

    let shouldNotify = false;
    for (const change of newChanges) {
      if (!_.includes(['leaveAlliance', 'joinAlliance', 'switchAlliance'], change.changeType)) {
        shouldNotify = true;
      }
    }

    // TODO: Remove or use highestSeverity
    if (shouldNotify) {
      const primaryChar = Keys.findOne({ keyID }).primaryChar;
      const email = new ChangeEmailNotification(newChanges, keyID, primaryChar);
      email.send();
    }
  } else {
    console.log('No new changes');
  }
};

export default handleChanges;
