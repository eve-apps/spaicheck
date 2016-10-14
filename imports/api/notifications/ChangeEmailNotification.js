import { Meteor } from 'meteor/meteor';

import _ from 'lodash';
import humanize from 'humanize-plus';

import EmailNotification from './EmailNotification';

export default class ChangeEmailNotification extends EmailNotification {
  constructor (changes, keyID, primaryChar) {
    // Construct subject
    const subject = ChangeEmailNotification.constructSubject(changes, primaryChar);

    // Construct body
    const body = ChangeEmailNotification.constructBody(changes, primaryChar);

    super(subject, body);
  }

  static getMainChange (changes) {
    let mainChange = changes[0];
    let invalidating = false;
    for (let i = 0; i < changes.length; i++) {
      if (_.includes(['INVALIDKEY', 'SINGLECHAR', 'BADMASK', 'EXPIRES', 'MALFORMEDKEY', 'CORPKEY'], changes[i].changeType)) {
        invalidating = true;
        mainChange = changes[i];
        break;
      }
    }

    return { mainChange, invalidating };
  }

  static constructSubject (changes, primaryChar) {
    const { mainChange, invalidating } = ChangeEmailNotification.getMainChange(changes);

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
  }

  static formatChange (valueObj) {
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
  }

  static constructBody (changes, primaryChar) {
    const divider = '\n______________________________\n';
    const softDivider = '\n------------------------------\n';

    let content = '';
    let data = '';

    for (const change of changes) {
      const valueObj = change.newValueObj || change.oldValueObj;

      data += ChangeEmailNotification.formatChange(valueObj);

      content += `${divider}Change Type: ${change.changeType}${softDivider}${data}`;
      data = '';
    }

    content += `\n\n<a href="${Meteor.absoluteUrl('app/home')}">Visit Spaicheck for more information.</a>`;
    content = content.replace(/\n/g, '<br>');
    return `Primary Character: ${primaryChar}\n${content}`;
  }
}
