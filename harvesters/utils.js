import fs from 'fs';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const writeToLocalFile = (jsonData, location) => {
  fs.writeFileSync(location, JSON.stringify(jsonData, null, 2));
  console.log('File successfully saved to', location);
};

export { sleep, writeToLocalFile };
