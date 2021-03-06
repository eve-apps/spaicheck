

const colorMarker = '&#9679';

const insertColorMarker = (severity) => {
  let severityColor = '';
  let titleStr = '';

  switch (severity) {
    case 'ERROR':
      titleStr = 'This key has at least 1 invalidating change';
      severityColor = 'red';
      break;
    case 'WARNING':
      titleStr = 'This key has at least 1 change, but is still valid';
      severityColor = '#FBBD08';
      break;
    case 'GOOD':
      titleStr = 'This key has not changed';
      severityColor = 'green';
      break;
    default:

  }

  const colorMarkerStyle = `color:${severityColor};margin-right:10px;font-size:250%;vertical-align:-25%;text-shadow:-1px 1px 2px #444;`;
  const colorMarkerStr = `<span title="${titleStr}" style="${colorMarkerStyle}">${colorMarker}</span> `;

  return colorMarkerStr;
};

export default insertColorMarker;
