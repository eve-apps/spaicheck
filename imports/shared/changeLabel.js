

export const insertChangeLabel = (changeType, severity) => {
  let severityColor = '';
  let severityTitle = '';

  switch (severity) {
    case 'ERROR':
      severityTitle = 'This change invalidates the key';
      severityColor = 'red';
      break;
    case 'WARNING':
      severityTitle = 'This change does not invalidate the key';
      severityColor = 'yellow';
      break;
    case 'GOOD':
      severityTitle = 'This change does not invalidate the key';
      severityColor = 'green';
      break;
    default:
      throw new Error(`Unknown severity ${severity}`);
  }

  return `<div class="ui ${severityColor} basic label change-label" title="${severityTitle}">${changeType}</div>`;
};
