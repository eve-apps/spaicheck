insertColorMarker = function (severity) {
  const colorMarker = '&#9679';
  let severityColor = '';
  let titleStr = '';

  if (severity == 'ERROR') {
    titleStr = 'This change invalidates the key';
    severityColor = '#FF0000';
  }
  else if (severity == 'WARNING') {
    titleStr = 'This change does not invalidate the key';
    severityColor = '#FFFF00';
  }

  let colorMarkerStyle = 'color:' + severityColor + ';margin-right:10px;font-size:250%;vertical-align:-25%;text-shadow:-2px 1px 3px #000;'
  let colorMarkerStr = '<span title="' + titleStr + '" style="' + colorMarkerStyle + '">' + colorMarker + '</span> ';

  return colorMarkerStr;
}
