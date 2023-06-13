const axios = require('axios');
const { loadConfig, sleep, writeToLocalFile } = require('./utils');

const CONF_JSON = 'conf/sciencebase.json';
const { baseUrl, keywordsBaseUrl, outputFilenamePrefix } =
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
    .get(`${baseUrl}/categories/get`, { params })
    .then((response) => response.data);
  const total = response.total;
  let list = response.list;
  while (list.length < total) {
    params.offset += 10;
    console.log('fetching next page: params', JSON.stringify(params, null, 2));
    const nextResponse = await axios
      .get(`${baseUrl}/categories/get`, { params })
      .then((response) => response.data);
    list = list.concat(nextResponse.list);
    await sleep(1000);
  }
  return { list };
};

const populateVocabulary = async (list, vocabulary, parentId) => {
  for (const item of list) {
    await sleep(1000);
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
  const rootNode = await getNode(baseId);
  let vocabulary = [];
  await populateVocabulary(rootNode.list, vocabulary, baseId);
  return vocabulary;
}

async function loadMetadataFromId(id) {
  let params = {
    format: 'json',
  };
  const metadata = await axios
    .get(`${baseUrl}/vocabulary/${id}`, { params })
    .then((response) => response.data);
  return metadata;
}

function generateCitation(metadata, outputFilename) {
  return {
    citation: {
      date: [
        {
          date: '',
          dateType: '',
        },
      ],
      description: metadata.description || '',
      title: metadata.name,
      edition: '',
      onlineResource: [
        {
          uri: metadata.uri,
        },
      ],
      identifier: [
        {
          identifier: metadata.id,
        },
      ],
    },
    keywordType: metadata.nodeType || '',
    label: metadata.label || '',
    dynamicLoad: true,
    keywordsUrl: `${keywordsBaseUrl}${outputFilename}`,
    keywords: [],
  };
}

async function generateKeywordsFile(vocabulary) {
  console.log('Generating keywords file for', vocabulary);
  const { id: sciencebaseId } = vocabulary;
  const metadata = await loadMetadataFromId(sciencebaseId);
  const keywords = await buildTree(sciencebaseId);
  const outputFilename = `${outputFilenamePrefix}${sciencebaseId}.json`;
  writeToLocalFile(keywords, outputFilename);
  console.log('Wrote keywords to', outputFilename);
  return generateCitation(metadata, outputFilename);
}

module.exports = { generateKeywordsFile };
