const axios = require('axios');
const { loadConfig, writeToLocalFile } = require('./utils');

const CONF_JSON = 'conf/usgs.json';
const { metadata, outputFilename, sqlUrl } = loadConfig(CONF_JSON);

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

const loadSql = async () => {
  const response = await axios.get(sqlUrl);
  return response.data;
};

async function generateKeywordsFile() {
  const sqlData = await loadSql();
  const tree = buildTree(sqlData);
  writeToLocalFile(tree, outputFilename);
  return metadata;
}

module.exports = { generateKeywordsFile };
