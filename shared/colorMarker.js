insertColorMarker = function (severity) {
  const colorMarker = '&#9679';
  let severityColor = '';
  let titleStr = '';

  switch (severity) {
    case 'ERROR':
      titleStr = 'This key has at least 1 invalidating change';
      severityColor = '#FF0000';
      break;
    case 'WARNING':
      titleStr = 'This key has at least 1 change, but is still valid';
      severityColor = '#FFFF00';
      break;
    case 'GOOD':
      titleStr = 'This key has not changed';
      severityColor = '#00FF00';
      break;
    default:

  }

  let colorMarkerStyle = 'color:' + severityColor + ';margin-right:10px;font-size:250%;vertical-align:-25%;text-shadow:-2px 1px 3px #000;'
  let colorMarkerStr = '<span title="' + titleStr + '" style="' + colorMarkerStyle + '">' + colorMarker + '</span> ';

  return colorMarkerStr;
}
