parseChange = function (changeType, severity, oldValStr, newValStr, oldValObj, newValObj, ctx) {
  let newVal = newValStr || newValObj || null;
  let oldVal = oldValStr || oldValObj || null;

  let colorMarkerStr = insertColorMarker(severity);

  let charName;
  if (ctx) charName = ctx.charName;
  else if (newVal) charName = newVal.characterName;
  else if (oldVal) charName = oldVal.characterName;

  let charStr = 'The character "' + charName + '" ';

  let oldName = ctx ? ctx.oldName : null;
  let newName = ctx ? ctx.newName : null;

  let changeTypeStr = '<span style="color:red;">' + changeType + '</span> '

  let contentStr;
  switch (changeType) {
    case 'INVALIDKEY':
      contentStr = 'This key has expired or been deleted.'
      break;
    case 'SINGLECHAR':
      contentStr = 'This key only provides info about a single character.';
      break;
    case 'BADMASK':
      contentStr = 'The access rights no longer satisfy the Corporation conditions.';
      break;
    case 'EXPIRES':
      contentStr = 'This key has been set to expire.';
      break;
    case 'leaveCorp':
      contentStr = charStr + 'left "' + oldName + '" and is now part of an NPC corporation.';
      break;
    case 'leaveAlliance':
      contentStr = charStr + 'and its corporation are no longer allied with "' + oldName + '".';
      break;
    case 'joinCorp':
      contentStr = charStr + 'joined the "' + oldName + '" corporation.';
      break;
    case 'joinAlliance':
      contentStr = charStr + 'and its corporation formed an alliance with "' + newName + '".';
      break;
    case 'switchCorp':
      contentStr = charStr + 'left "' + oldName + '" to join "' + newName + '".';
      break;
    case 'switchAlliance':
      contentStr = charStr + 'and its corporation broke their alliance with "' + oldName + '" to form a new alliance with "' + newName + '".';
      break;
    case 'addCharacter':
      contentStr = charStr + 'has been created.';
      break;
    case 'removeCharacter':
      contentStr = charStr + 'has been deleted.';
      break;
    default:
  }

  dispStr = '<p>' + colorMarkerStr + changeTypeStr + contentStr + '</p>';

  return dispStr;
}
