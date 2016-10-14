import { Meteor } from 'meteor/meteor';
import { Job } from 'meteor/vsivsi:job-collection';
import _ from 'lodash';

// TODO: Refactor this

import jsonPatch from 'fast-json-patch';
import humanize from 'humanize-plus';
import { emailJobs } from '/imports/server/jobs';
import Keys from '/imports/api/keys/Keys';
import Whitelist from '/imports/api/whitelist/Whitelist';
import Changes from '/imports/api/changes/Changes';

import { validateKey } from '/imports/api/keys/methods';

// Notification base class
class Notification {
  // constructor() {}
}

class NotificationEmail extends Notification {
  constructor (subject, body) {
    super();

    this.subject = subject;
    this.body = body;
    this.retries = 3;
    this.retryWaitMs = 5 * 60 * 1000;
  }

  send (to, retries = this.retries, retryWaitMs = this.retryWaitMs) {
    let target = to;
    if (target == null) {
      target = _.map(Whitelist.find({ $and: [{ emailAddress: { $ne: null } }, { notify: true }] }, { fields: { emailAddress: true, _id: false } }).fetch(), 'emailAddress');
    } else if (!_.isArray(target)) {
      target = [target];
    }

    if (!target.length) {
      console.warn('No recipients for notification!');
      return;
    }

    console.log(target);

    _.forEach(target, (address) => {
      new Job(emailJobs, 'sendEmail', {
        to: address,
        subject: this.subject,
        body: this.body,
      }).retry({ retries, wait: retryWaitMs }).save();
    });
  }
}

class ChangeNotificationEmail extends NotificationEmail {
  constructor (changes, keyID, primaryChar) {
    // Construct subject
    const subject = (function constructSubject () {
      let mainChange = changes[0];
      let invalidating = false;
      for (let i = 0; i < changes.length; i++) {
        if (_.includes(['INVALIDKEY', 'SINGLECHAR', 'BADMASK', 'EXPIRES', 'MALFORMEDKEY', 'CORPKEY'], changes[i].changeType)) {
          invalidating = true;
          mainChange = changes[i];
          break;
        }
      }

      let result = invalidating ? `${primaryChar}'s key is no longer valid: ` : `Update on ${primaryChar}'s account: `;

      let noTail = false;
      switch (mainChange.changeType) {
        case 'addCharacter':
          result += `Character "${mainChange.newValueObj.characterName}" has been created`;
          break;
        case 'removeCharacter':
          result += `Character "${mainChange.oldValueObj.characterName}" has been removed`;
          break;
        case 'joinCorp':
          result += `Character "${mainChange.newValueObj.characterName}" has joined the "${mainChange.newValueObj.corporationName}" corporation`;
          break;
        case 'leaveCorp':
          result += `Character "${mainChange.oldValueObj.characterName}" has left the "${mainChange.oldValueObj.corporationName}" corporation`;
          break;
        case 'switchCorp':
          result += `Character "${mainChange.oldValueObj.characterName}" has left the "${mainChange.oldValueObj.corporationName}" corporation to join "${mainChange.newValueObj.corporationName}"`;
          break;
        case 'INVALIDKEY':
          result += 'Key has expired or been deleted';
          break;
        case 'SINGLECHAR':
          result += 'Key now only provides info about a single character';
          break;
        case 'BADMASK':
          result += 'Key no longer provides all permissions';
          break;
        case 'EXPIRES':
          result += 'Key has been set to expire';
          break;
        case 'MALFORMEDKEY':
          result += 'Key\'s verification code has changed';
          break;
        case 'CORPKEY':
          result += 'Key is now a corporation key, not a player key';
          break;
        default:
          result += `${changes.length} ${humanize.pluralize(changes.length, 'change')}`;
          noTail = true;
      }

      if (!noTail && changes.length > 1) {
        result += `, and ${changes.length - 1} more ${humanize.pluralize(changes.length - 1, 'change')}`;
      }
      // 'leaveAlliance'
      // 'joinAlliance'
      // 'switchAlliance'

      return result;
    }());


    const formatChange = (valueObj) => {
      let data = '';
      Object.keys(valueObj).forEach((fieldName) => {
        switch (fieldName) {
          case 'characterName':
            data += `${fieldName}: ${valueObj[fieldName]} <a href="https://zkillboard.com/character/${valueObj.characterID}/">[zKillboard]</a> <a href="http://evewho.com/pilot/${valueObj.characterName.replace(/ /g, '+')}/">[EveWho]</a>\n`;
            break;
          case 'corporationName':
            data += `${fieldName}: ${valueObj[fieldName]} <a href="https://zkillboard.com/corporation/${valueObj.corporationID}/">[zKillboard]</a> <a href="http://evewho.com/corp/${valueObj.corporationName.replace(/ /g, '+')}/">[EveWho]</a>\n`;
            break;
          case 'allianceName':
            data += valueObj.allianceID !== '0' ? `${fieldName}: ${valueObj[fieldName]} <a href="https://zkillboard.com/alliance/${valueObj.allianceID}/">[zKillboard]</a> <a href="http://evewho.com/alli/${valueObj.allianceName.replace(/ /g, '+')}/">[EveWho]</a>\n` : `${fieldName}: \n`;
            break;
          default:
            data += `${fieldName}: ${valueObj[fieldName]}\n`;
        }
      });
      return data;
    };
    // Construct body
    const body = (function constructBody () {
      const divider = '\n______________________________\n';
      const softDivider = '\n------------------------------\n';

      let content = '';
      let data = '';

      for (const change of changes) {
        const valueObj = change.newValueObj || change.oldValueObj;

        data += formatChange(valueObj);

        content += `${divider}Change Type: ${change.changeType}${softDivider}${data}`;
        data = '';
      }

      content += `\n\n<a href="${Meteor.absoluteUrl('app/home')}">Visit Spaicheck for more information.</a>`;
      content = content.replace(/\n/g, '<br>');
      return `Primary Character: ${primaryChar}\n${content}`;
    }());

    super(subject, body);
  }
}

Meteor.methods({
  async runChecks () {
    console.log('Updating keys...');
    // Fetch all keys from the database and validate them
    const curKeys = Keys.find({}).fetch();
    let curTimeout = 0;

    if (curKeys.length) {
      console.log(`Checking ${curKeys.length} keys...`);
    } else {
      console.log('No keys to check.');
    }
    for (let i = 0; i < curKeys.length; i++) {
      // Limit calls to 30 per second by staggering them by 1 30th of a second
      Meteor.setTimeout(async () => {
        const fnStart = new Date();

        if (curKeys[i].status === 'ERROR') {
          try {
            const result = await validateKey(curKeys[i].keyID, curKeys[i].vCode);

            Keys.update({ keyID: curKeys[i].keyID }, {
              $set: {
                resultBody: result,
                status: 'GOOD',
              },
            });
          } catch (err) {
            throw err;
          }
        } else {
          console.log('current key:', curKeys[i]);
          try {
            const result = await validateKey(curKeys[i].keyID, curKeys[i].vCode);
            Meteor.call('handleChanges', curKeys[i].keyID, undefined, result);
          } catch (err) {
            Meteor.call('handleChanges', curKeys[i].keyID, err, undefined);
          }
          const fnEnd = new Date();
          const fnDelta = fnEnd - fnStart;
          console.log(`Check for key #${curKeys[i].keyID} finished in ${fnDelta}ms`);
        }
      }, curTimeout += Math.ceil(1000 / 30));

      console.log(`Will check key #${curKeys[i].keyID} after ${curTimeout}ms...`);
    }
  },
  handleChanges (keyID, err, result) {
    // Create array to hold all changes to key since last check
    const ignoredErrors = ['CONNERR', 'INTERNAL'];
    const newChanges = [];

    // Build out the newChanges array
    if (err) {
      if (!err.error) {
        console.log('unhandled error in handleChanges', err);
        throw err;
      }
      // Push the error, unless it's on the ignoredErrors list
      if (ignoredErrors.indexOf(err.error) > -1) console.log(err); // Connection errors etc are logged to console and ignored
      // Handle corporation check failures; all failed checks are iterated over and each represents a separate change
      else if (err.error.indexOf(',') > -1) {
        for (const flag of err.error.split(', ')) {
          newChanges.push({ changeType: flag, severity: 'ERROR' });
        }
      } else {
        newChanges.push({ changeType: err.error, severity: 'ERROR' });
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

        Meteor.call('addKeyCharacters', keyID);
      }
    }
    if (newChanges.length !== 0) {
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

      let shouldNotify = null;
      for (const change of newChanges) {
        if (!_.includes(['leaveAlliance', 'joinAlliance', 'switchAlliance'], change.changeType)) {
          shouldNotify = true;
        }
      }

      // TODO: Remove or use highestSeverity
      if (shouldNotify) {
        const primaryChar = Keys.findOne({ keyID }).primaryChar;
        const email = new ChangeNotificationEmail(newChanges, keyID, primaryChar);
        email.send();
      }
    } else {
      console.log('No new changes');
    }
  },
});
