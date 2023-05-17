const fs = require('fs');

const loadConfig = (configFilename) => {
  console.log('Loading config from', configFilename);
  const configData = fs.readFileSync(configFilename, 'utf-8');
  return JSON.parse(configData);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const throwError = (msg) => {
  console.log(`Error: ${msg}`);
  process.exit(1);
};

const writeToLocalFile = (jsonData, filename = 'output.json') => {
  console.log(`Saving to resources/json/${filename}`);
  fs.writeFileSync(
    `../resources/json/${filename}`,
    JSON.stringify(jsonData, null, 2)
  );
  console.log('File saved successfully');
};

module.exports = { loadConfig, sleep, throwError, writeToLocalFile };
