const fs = require('fs');

const loadConfig = (configFilename) => {
  console.log('Loading config from', configFilename);
  const configData = fs.readFileSync(configFilename, 'utf-8');
  return JSON.parse(configData);
};

const KeywordPrototype = {
  uuid: '',
  parentId: '',
  label: '',
  definition: '',
  children: [],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const writeToLocalFile = (jsonData, filename = 'output.json') => {
  console.log(`Saving to resources/json/${filename}`);
  fs.writeFileSync(
    `../resources/json/${filename}`,
    JSON.stringify(jsonData, null, 2)
  );
  console.log('File saved successfully');
};

module.exports = { loadConfig, KeywordPrototype, sleep, writeToLocalFile };
