const axios = require('axios');
const { loadConfig, sleep } = require('./utils');

const CONF_JSON = 'conf/main.json';
const { baseUrl } = loadConfig(CONF_JSON).gcmd;

async function fetchConceptById(id) {
  try {
    const response = await axios.get(`${baseUrl}concept/${id}?format=json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching concept data', id, error);
    return null;
  }
}

async function fetchKeywordById(id) {
  try {
    const response = await axios.get(`${baseUrl}keyword/${id}?format=json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching keyword data', id, error);
    return null;
  }
}

const loadMetadata = async (vocabulary) => {
  await sleep(50);
  const { id } = vocabulary;
  const conceptData = await fetchConceptById(id);
  const keywordData = await fetchKeywordById(id);
  return { ...vocabulary, conceptData, keywordData };
};

function generateNode(metadata) {
  return {
    uuid: metadata.conceptData.uuid,
    label: metadata.conceptData.prefLabel,
    broader: metadata?.conceptData?.broader[0]?.uuid || null,
    definition:
      metadata?.conceptData?.definitions[0]?.text ||
      metadata?.keywordData?.definition ||
      'No definition available.',
    children: [],
  };
}

async function buildChildren(metadata) {
  if (metadata.conceptData.isLeaf) {
    return [];
  }
  const narrowerList = metadata.conceptData.narrower;
  const children = [];
  for (let i = 0; i < narrowerList.length; i++) {
    const narrower = narrowerList[i];
    const narrowerMetadata = await loadMetadata({
      id: narrower.uuid,
      isLeaf: narrower.isLeaf,
      name: narrower.prefLabel,
    });
    const narrowerChildren = await buildChildren(narrowerMetadata);
    const node = generateNode(narrowerMetadata);
    node.children = narrowerChildren;
    children.push(node);
  }
  return children;
}

const buildKeywordTree = async (metadata) => {
  const node = generateNode(metadata);
  node.children = await buildChildren(metadata);
  return [node];
};

function buildCitation(metadata) {
  return {
    citation: {
      date: [
        {
          date: metadata.conceptData.schemeVersion,
          dateType: 'revision',
        },
      ],
      description: metadata.description || 'No description available.',
      title: `Global Change Master Directory (GCMD) ${metadata.conceptData.prefLabel}`,
      edition: `Version ${metadata.conceptData.keywordVersion}`,
      onlineResource: [
        {
          uri: `${baseUrl}concept/${metadata.conceptData.uuid}?format=json}`,
        },
      ],
      identifier: [
        {
          identifier: metadata.conceptData.uuid,
        },
      ],
    },
    keywordType: metadata?.conceptData?.scheme?.shortName,
    label: metadata.conceptData.prefLabel,
    keywords: [],
  };
}

async function generateKeywords(vocabulary) {
  const metadata = await loadMetadata(vocabulary);
  const keywordsJson = await buildKeywordTree(metadata);
  return keywordsJson;
}

async function generateCitation(vocabulary) {
  const metadata = await loadMetadata(vocabulary);
  const citation = buildCitation(metadata);
  return citation;
}

module.exports = { generateCitation, generateKeywords };
