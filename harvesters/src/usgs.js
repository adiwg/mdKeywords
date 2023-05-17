/* global process */
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config({ path: 'src/usgs/.env' });
const axios = require('axios');
const { loadConfig, writeToLocalFile } = require('../utils');

const { CONF_JSON } = process.env;
const { OUTPUT_FILENAME, SQL_SOURCE } = loadConfig(CONF_JSON);

const regex = /insert into term \(code,name,parent,scope\) values \((.*)\);$/gm;

const COLUMN = Object.freeze({
  CODE: 0,
  NAME: 1,
  PARENT: 2,
  SCOPE: 3,
});

const parseSql = (sqlData) => {
  let m;
  let results = [];
  while ((m = regex.exec(sqlData)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    results.push(
      // eslint-disable-next-line quotes
      eval(`[${m[1].replace(/NULL/g, '""').replace(/''/g, "\\'")}]`)
    );
  }
  return results;
};

const getRootNode = (parsedData) => {
  const rootIndex = parsedData.findIndex((node) => {
    return node[COLUMN.PARENT] === '';
  });
  return parsedData[rootIndex];
};

const findChildren = (data, parent) => {
  const results = [];
  data.forEach((node) => {
    if (node[COLUMN.PARENT] === parent) {
      results.push({
        uuid: node[COLUMN.CODE],
        label: node[COLUMN.NAME],
        definition: node[COLUMN.SCOPE],
        children: findChildren(data, node[COLUMN.CODE]),
      });
    }
  });
  return results;
};

const buildTree = (sqlData) => {
  const parsedData = parseSql(sqlData);
  const rootNode = getRootNode(parsedData);
  return findChildren(parsedData, rootNode[COLUMN.CODE]);
};

// TODO
// const loadSqlFromSource = (source) => {};

async function main() {
  const response = await axios.get(SQL_SOURCE).catch((err) => {
    console.log('Error retrieving data from source', SQL_SOURCE, err);
    process.exit(1);
  });
  const sqlData = response.data;
  // TODO const sqlData = await loadSqlFromSource(SQL_SOURCE);
  const tree = buildTree(sqlData);
  console.log('Build completed successfully.');
  writeToLocalFile(tree, OUTPUT_FILENAME);
}

main();
