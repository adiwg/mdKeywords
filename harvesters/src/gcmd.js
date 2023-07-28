const axios = require('axios');
const { loadConfig, sleep, writeToLocalFile } = require('./utils');
const CONF_JSON = 'conf/gcmd.json';

const { baseUrl, outputFilePrefix, outputFileBaseUrl } = loadConfig(CONF_JSON);

function generateFilename(name) {
  return `${outputFilePrefix}${name}.json`;
}

async function fetchConceptById(id) {
  try {
    sleep(500);
    const response = await axios.get(`${baseUrl}concept/${id}?format=json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data: ', error);
    return null;
    // throw error;
  }
}

// async function fetchConceptsByScheme(scheme) {
//   console.log('fetchConceptsByScheme(scheme)', scheme);
//   try {
//     const { shortName } = scheme;
//     const response = await axios.get(
//       `${baseUrl}concepts/concept_scheme/${shortName}?format=json&scheme=${shortName}`
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching data: ', error);
//     throw error;
//   }
// }

async function fetchKeywordById(id) {
  try {
    sleep(500);
    const response = await axios.get(`${baseUrl}keyword/${id}?format=json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data: ', error);
    return null;
    // throw error;
  }
}

const loadMetadata = async (vocabulary) => {
  const { id, name } = vocabulary;
  console.log('loadMetadata', id, name);
  sleep(500);
  const conceptData = await fetchConceptById(id);
  // const schemeData = await fetchConceptsByScheme(conceptData.scheme);
  const keywordData = await fetchKeywordById(id);
  if (!conceptData || !keywordData) {
    return null;
  }
  return { ...vocabulary, conceptData, /*  schemeData, */ keywordData };
};

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
    });
    if (!narrowerMetadata) {
      console.log('narrowerMetadata not found', narrower);
      continue;
    }
    const narrowerChildren = await buildChildren(narrowerMetadata);
    children.push({
      broader: narrowerMetadata?.conceptData?.broader[0]?.uuid || null,
      label: narrowerMetadata.conceptData.prefLabel,
      definition: narrowerMetadata.keywordData.definition,
      children: narrowerChildren,
    });
  }
  return children;
}

const buildKeywordTree = async (metadata) => {
  const tree = [
    {
      broader: null,
      uuid: metadata.conceptData.uuid,
      label: metadata.conceptData.prefLabel,
      definition:
        metadata.keywordData.definition || 'No description available.',
      children: [await buildChildren(metadata)],
    },
  ];
  return tree;
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
      description: 'No description available.',
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
    keywordType: metadata.scheme,
    label: metadata.conceptData.prefLabel,
    dynamicLoad: true,
    keywordsUrl: `${outputFileBaseUrl}${generateFilename(
      metadata.conceptData.scheme.shortName
    )}`,
    keywords: [],
  };
}

async function generateKeywordsFile(vocabulary) {
  console.log('generateKeywordsFile(vocabulary)', vocabulary);
  const metadata = await loadMetadata(vocabulary);
  const keywordsJson = await buildKeywordTree(metadata);
  const filename = generateFilename(metadata.conceptData.scheme.shortName);
  console.log('keywordsJson', keywordsJson);
  if (keywordsJson) writeToLocalFile(keywordsJson, filename);
}

async function generateCitation(vocabulary) {
  const metadata = await loadMetadata(vocabulary);
  const citation = buildCitation(metadata);
  return citation;
}

module.exports = { generateCitation, generateKeywordsFile };
