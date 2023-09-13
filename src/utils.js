const fs = require('fs');

const loadConfig = (configFilename) => {
  console.log('Loading config from', configFilename);
  const configData = fs.readFileSync(configFilename, 'utf-8');
  return JSON.parse(configData);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const writeToLocalFile = (
  jsonData,
  filename = 'output.json',
  filepath = 'resources/json'
) => {
  const outputDestination = `${filepath}/${filename}`;
  fs.writeFileSync(
    `${filepath}/${filename}`,
    JSON.stringify(jsonData, null, 2)
  );
  console.log('File successfully saved to', outputDestination);
};

module.exports = { loadConfig, sleep, writeToLocalFile };
