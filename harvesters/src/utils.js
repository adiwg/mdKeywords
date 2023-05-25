const fs = require('fs');

const loadConfig = (configFilename) => {
  console.log('Loading config from', configFilename);
  const configData = fs.readFileSync(configFilename, 'utf-8');
  return JSON.parse(configData);
};

const KeywordPrototype = {
  uuid: null,
  parentId: null,
  label: null,
  definition: null,
  children: [],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const writeToLocalFile = (
  jsonData,
  filename = 'output.json',
  filepath = 'resources/json'
) => {
  console.log(`Saving to ${filepath}/${filename}`);
  fs.writeFileSync(
    `../${filepath}/${filename}`,
    JSON.stringify(jsonData, null, 2)
  );
  console.log('File saved successfully');
};

module.exports = { loadConfig, KeywordPrototype, sleep, writeToLocalFile };
