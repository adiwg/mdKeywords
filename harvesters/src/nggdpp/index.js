/* global process */
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config({ path: 'src/nggdpp/.env' });
const axios = require('axios');
const { loadConfig, sleep, writeToLocalFile } = require('../utils');

const { CONF_JSON } = process.env;
const { BASE_URL, OUTPUT_FILENAME, ROOT_NODES, VOCAB_URL } =
  loadConfig(CONF_JSON);

const getNode = async (parentId, nodeType) => {
  let params = {
    parentId,
    nodeType,
    max: 10,
    offset: 0,
    format: 'json',
  };
  const response = await axios
    .get(`${BASE_URL}/get`, { params })
    .then((response) => response.data);
  console.log('response', JSON.stringify(response, null, 2));
  const total = response.total;
  let list = response.list;
  console.log('total', total);
  console.log('list', list.length);
  while (list.length < total) {
    params.offset += 10;
    console.log('fetching next page: params', JSON.stringify(params, null, 2));
    const nextResponse = await axios
      .get(`${BASE_URL}/get`, { params })
      .then((response) => response.data);
    list = list.concat(nextResponse.list);
    console.log('total', total);
    console.log('list', list.length);
    await sleep(1000);
  }
  return { list };
};

const populateVocabulary = async (list, vocabulary, parentId) => {
  for (const item of list) {
    await sleep(1000);
    console.log();
    console.log('populating: item' /* , JSON.stringify(item, null, 2) */);
    console.log('id:', item.id);
    console.log('name:', item.name);
    console.log('nodeType:', item.nodeType);
    if (item.nodeType === 'vocabulary') {
      let terms = [];
      vocabulary.push({
        uuid: item.id,
        label: item.name,
        definition: item.description || '',
        children: terms,
      });
      const termNode = await getNode(item.id, 'term');
      for (const termItem of termNode.list) {
        terms.push({
          uuid: termItem.id,
          parentId: item.id,
          label: termItem.name,
          definition: termItem.description,
        });
      }
    } else {
      const node = await getNode(item.id);
      let children = [];
      vocabulary.push({
        uuid: item.id,
        parentId,
        label: item.name,
        definition: item.description || '',
        children,
      });
      await populateVocabulary(node.list, children, item.id);
    }
  }
};

async function buildTree(baseId) {
  console.log(
    '==============Building tree from',
    baseId,
    '==================='
  );
  const rootNode = await getNode(baseId);
  let vocabulary = [];
  await populateVocabulary(rootNode.list, vocabulary, baseId);
  return vocabulary;
}

// This request actually retrieves the entire "root" object - this might be useful...
async function getLabel(id) {
  console.log('Getting label for', id);
  let params = {
    format: 'json',
  };
  const response = await axios
    .get(`${VOCAB_URL}/${id}`, { params })
    .then((response) => response.data);
  console.log('response', JSON.stringify(response, null, 2));
  return response.name;
}

async function main() {
  const consolidatedVocabulary = [];
  for (const uuid of ROOT_NODES) {
    if (uuid === '') {
      console.log('skipping empty node id');
      continue;
    }
    const vocab = await buildTree(uuid).catch((e) => console.log(e));
    const label = await getLabel(uuid);
    const nextNode = {
      uuid,
      label,
      children: vocab,
    };
    consolidatedVocabulary.push(nextNode);
  }
  writeToLocalFile(consolidatedVocabulary, OUTPUT_FILENAME);
}

main();
