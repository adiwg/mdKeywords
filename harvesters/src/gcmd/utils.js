const { writeToLocalFile } = require('../utils');

function saveJsonToFile(id, json, prefix) {
  const filename = `${prefix}${id}.json`;
  writeToLocalFile(json, filename);
}

function parseMeta(data) {
  return data.split(/:(.*)/s)[1].replace('"', '').replace(/ /s, '');
}

// Primary cell is the cell associated with the UUID
function isPrimaryCell(keyword, headers, headerIndex) {
  const nextHeader = headers[headerIndex + 1];
  const nextLabel = keyword[nextHeader];
  if (nextHeader === 'UUID') {
    return true;
  }
  if (nextLabel === '') {
    return isPrimaryCell(keyword, headers, headerIndex + 1);
  }
  return false;
}

function hasError(currentHeader, headerIndex, headersLength) {
  return currentHeader === 'UUID' || headerIndex >= headersLength;
}

module.exports = { hasError, isPrimaryCell, parseMeta, saveJsonToFile };
