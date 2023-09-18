const fs = require('fs');

const loadConfig = (configFilename) => {
  console.log('Loading config from', configFilename);
  const configData = fs.readFileSync(configFilename, 'utf-8');
  return JSON.parse(configData);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const writeToLocalFile = (jsonData, location) => {
  fs.writeFileSync(location, JSON.stringify(jsonData, null, 2));
  console.log('File successfully saved to', location);
};

module.exports = { loadConfig, sleep, writeToLocalFile };
