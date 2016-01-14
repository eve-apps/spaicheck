insertColorMarker = function (severity, isKey) {
  const colorMarker = '&#9679';
  let severityColor = '';
  let titleStr = '';

  switch (severity) {
    case 'ERROR':
      titleStr = isKey ? 'This key has at least 1 invalidating change' : 'This change invalidates the key';
      severityColor = '#FF0000';
      break;
    case 'WARNING':
      titleStr = isKey ? 'This key has at least 1 change, but is still valid' : 'This change does not invalidate the key';
      severityColor = '#FFFF00';
      break;
    case 'GOOD':
      titleStr = isKey ? 'This key has not changed' : 'This change does not invalidate the key';
      severityColor = '#00FF00';
      break;
    default:

  }

  let colorMarkerStyle = 'color:' + severityColor + ';margin-right:10px;font-size:250%;vertical-align:-25%;text-shadow:-2px 1px 3px #000;'
  let colorMarkerStr = '<span title="' + titleStr + '" style="' + colorMarkerStyle + '">' + colorMarker + '</span> ';

  return colorMarkerStr;
}
