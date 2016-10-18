import { Meteor } from 'meteor/meteor';

import _ from 'lodash';
import humanize from 'humanize-plus';

import ttp from '/imports/shared/trimTrailingPunctuation';
import getIssueDesc from '/imports/shared/getIssueDescription';
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

    result += ttp(ChangeEmailNotification.getChangeDesc(mainChange));

    if (changes.length > 1) {
      result += `, and ${changes.length - 1} more ${humanize.pluralize(changes.length - 1, 'change')}`;
    }

    return result;
  }

  // A thin wrapper around getIssueDesc that passes along the issue data
  static getChangeDesc (change) {
    switch (change.changeType) {
      case 'addCharacter':
      case 'removeCharacter':
        return getIssueDesc(change.changeType, false, {
          characterName: change.newValueObj.characterName,
        });
      case 'joinCorp':
      case 'leaveCorp':
        return getIssueDesc(change.changeType, false, {
          characterName: change.newValueObj.characterName,
          corporationName: change.newValueObj.corporationName,
        });
      case 'switchCorp':
        return getIssueDesc(change.changeType, false, {
          characterName: change.newValueObj.characterName,
          oldCorporationName: change.oldValueObj.corporationName,
          newCorporationName: change.newValueObj.corporationName,
        });
      default:
        return getIssueDesc(change.changeType, false);
    }
  }

  static formatChangeDetails (change) {
    // Used to print additional information about a change
    const valueObj = change.newValueObj || change.oldValueObj;

    // Just return an empty string if there are no details to format
    if (!valueObj) return '';

    let data = '\n------------------------------\n';
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

    let content = '';

    for (const change of changes) {
      const changeData = ChangeEmailNotification.formatChangeDetails(change);

      content += `${divider}${change.changeType}: ${ChangeEmailNotification.getChangeDesc(change)} ${changeData}`;
    }

    content += `\n\n<a href="${Meteor.absoluteUrl('app/home')}">Visit Spaicheck for more information.</a>`;
    content = content.replace(/\n/g, '<br>');
    return `Primary Character: ${primaryChar}\n${content}`;
  }
}
