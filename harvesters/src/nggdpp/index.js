/*global process */
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config({ path: 'src/nggdpp/.env' });
const axios = require('axios');
const uuid = require('uuid');
const { loadConfig, sleep, writeToLocalFile } = require('../utils');

const { CONF_JSON } = process.env;
const { BASE_URL, OUTPUT_FILENAME_PREFIX, ROOT_NODES } = loadConfig(CONF_JSON);

const UUID_V5_NAMESPACE = uuid.v5(BASE_URL, uuid.v5.URL);

const getNode = async (parentId, nodeType) => {
  let params = {
    parentId,
    nodeType,
    max: 10,
    offset: 0,
    format: 'json',
  };
  // TODO handle pagination
  const response = await axios
    .get(`${BASE_URL}/get`, { params })
    .then((response) => response.data);
  // const fetched = response.list.length;
  const total = response.total;
  let list = response.list;
  console.log('total', total);
  console.log('list.length', list.length);
  while (list.length < total) {
    await sleep(1000);
    params.offset += 10;
    console.log('fetching next page');
    const nextResponse = await axios
      .get(`${BASE_URL}/get`, { params })
      .then((response) => response.data);
    list = list.concat(nextResponse.list);
    console.log('total', total);
    console.log('list.length', list.length);
  }
  return { list };
};

const populateVocabulary = async (list, vocabulary, parentUuid) => {
  for (const item of list) {
    await sleep(1000);
    console.log();
    console.log('populating:');
    console.log('id:', item.id);
    console.log('name:', item.name);
    console.log('nodeType:', item.nodeType);
    const itemUuid = uuid.v5(item.id, UUID_V5_NAMESPACE);
    if (item.nodeType === 'vocabulary') {
      let terms = [];
      vocabulary.push({
        uuid: itemUuid,
        broader: parentUuid,
        label: item.name,
        definition: item.description || '',
        children: terms,
      });
      const termNode = await getNode(item.id, 'term');
      console.log('termNode length:', termNode.list.length);
      for (const termItem of termNode.list) {
        terms.push({
          uuid: uuid.v5(termItem.id, UUID_V5_NAMESPACE),
          broader: itemUuid,
          label: termItem.name,
          definition: termItem.description,
        });
      }
    } else {
      const node = await getNode(item.id);
      console.log('node.list.length', node.list.length);
      let children = [];
      vocabulary.push({
        uuid: itemUuid,
        broader: parentUuid,
        label: item.name,
        definition: item.description || '',
        children,
      });
      await populateVocabulary(node.list, children, itemUuid);
    }
  }
};

async function buildTree(baseId) {
  console.log('Building tree from', baseId);
  const rootNode = await getNode(baseId);
  let vocabulary = [];
  const rootUuid = uuid.v5(baseId, UUID_V5_NAMESPACE);
  await populateVocabulary(rootNode.list, vocabulary, rootUuid);
  writeToLocalFile(vocabulary, `${OUTPUT_FILENAME_PREFIX}${baseId}.json`);
}

async function main() {
  for (const nodeId of ROOT_NODES) {
    await buildTree(nodeId).catch((e) => console.log(e));
  }
}

main();
