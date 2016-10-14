const getErrorDescription = (error) => {
  switch (error.error) {
    case 'INTERNAL':
      return 'Internal error.';
    case 'CONNERR':
      return 'Connection error.';
    case 'EXISTINGKEY':
      return 'This or another key already exists for this player.';
    case 'INVALIDKEY':
      return 'Key has expired or been deleted.';
    case 'MALFORMEDKEY':
      return 'KeyID and/or vCode is invalid.';
    case 'BADMASK':
      return 'Key doesn\'t provide correct access rights.';
    case 'SINGLECHAR':
      return 'Key only provides info about a single character.';
    case 'CORPKEY':
      return 'Key is a corporation key, not a player key.';
    case 'EXPIRES':
      return 'Key is set to expire.';
    case 'UNHANDLED':
      return `Unhandled API error code ${error.errCode}.`;
    default:
      return 'Unknown error type.';
  }
};

export default getErrorDescription;
