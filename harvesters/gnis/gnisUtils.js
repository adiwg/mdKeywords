import fs from 'fs';
import readline from 'readline';
import xml2js from 'xml2js';

import { gnisConfig } from './gnisConfig';

const { DATA_DIR } = gnisConfig;

export async function parseTxtFileToJson(filePath) {
  console.log('Parsing TXT File', filePath);
  const fullRelativePath = `${DATA_DIR}/${filePath}`;
  const filestream = fs.createReadStream(fullRelativePath, 'utf-8');
  const rl = readline.createInterface({
    input: filestream,
    crlfDelay: Infinity
  });
  const headers = [];
  const results = [];
  for await (const line of rl) {
    if (headers.length === 0) {
      const tmpHeaders = line.split('|');
      if (tmpHeaders[0].charCodeAt(0) === 0xfeff) {
        tmpHeaders[0] = tmpHeaders[0].substring(1);
      }
      tmpHeaders.forEach(header => {
        headers.push(header);
      });
    } else {
      const record = line.split('|');
      const recordObj = {};
      headers.forEach((header, index) => {
        recordObj[header] = record[index];
      });
      results.push(recordObj);
    }
  }
  return results;
}

export async function parseCitationFromXml(filePath) {
  console.log('Parsing XML File', filePath);
  // load xml file
  const xmlData = fs.readFileSync(`${DATA_DIR}/${filePath}`, 'utf-8');
  // parse xml
  const parser = new xml2js.Parser();
  let citation;
  parser.parseString(xmlData, (err, result) => {
    if (err) {
      console.error('Error parsing XML', err);
    } else {
      citation = result;
    }
  });
  return citation;
}
