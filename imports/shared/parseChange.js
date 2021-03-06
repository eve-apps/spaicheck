import insertChangeLabel from '/imports/shared/changeLabel';
import insertColorMarker from '/imports/shared/colorMarker';

const parseChange = (changeType, severity, oldValStr, newValStr, oldValObj, newValObj, ctx, forEmail) => {
  const newVal = newValStr || newValObj || null;
  const oldVal = oldValStr || oldValObj || null;

  let charName;
  if (ctx) charName = ctx.charName;
  else if (newVal) charName = newVal.characterName;
  else if (oldVal) charName = oldVal.characterName;

  const charStr = `The character "${charName}" `;

  const oldName = ctx ? ctx.oldName : null;
  const newName = ctx ? ctx.newName : null;

  let contentStr;
  switch (changeType) {
    case 'INVALIDKEY':
      contentStr = 'This key has expired or been deleted.';
      break;
    case 'SINGLECHAR':
      contentStr = 'This key only provides info about a single character.';
      break;
    case 'BADMASK':
      contentStr = 'This key\'s access mask does not provide full access.';
      break;
    case 'EXPIRES':
      contentStr = 'This key has been set to expire.';
      break;
    case 'leaveCorp':
      contentStr = `${charStr}left "${oldName}" and is now part of an NPC corporation.`;
      break;
    case 'leaveAlliance':
      contentStr = `${charStr}and their corporation are no longer allied with "${oldName}".`;
      break;
    case 'joinCorp':
      contentStr = `${charStr}joined the "${oldName}" corporation.`;
      break;
    case 'joinAlliance':
      contentStr = `${charStr}and their corporation formed an alliance with "${newName}".`;
      break;
    case 'switchCorp':
      contentStr = `${charStr}left "${oldName}" to join "${newName}".`;
      break;
    case 'switchAlliance':
      contentStr = `${charStr}and their corporation broke their alliance with "${oldName}" to form an alliance with "${newName}".`;
      break;
    case 'addCharacter':
      contentStr = `${charStr}has been created.`;
      break;
    case 'removeCharacter':
      contentStr = `${charStr}has been deleted.`;
      break;
    default:
  }

  const dispStr = `${forEmail ? insertColorMarker(severity) : insertChangeLabel(changeType, severity)}<span class="change-text">${contentStr}</span>`;
  return dispStr;
};

export default parseChange;
