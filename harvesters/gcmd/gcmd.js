import axios from 'axios';
import { sleep, writeToLocalFile } from '../utils';
import dayjs from 'dayjs';

import vocabularies from './vocabularies.json';

const baseUrl = 'https://gcmd.earthdata.nasa.gov/kms/';
const thesaurusPath = 'resources/thesaurus/';
const keywordsPath = 'resources/keywords/';

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

const loadMetadata = async vocabulary => {
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
    parentId: metadata?.conceptData?.broader[0]?.uuid || null,
    definition:
      metadata?.conceptData?.definitions[0]?.text ||
      metadata?.keywordData?.definition ||
      '',
    children: []
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
      name: narrower.prefLabel
    });
    const narrowerChildren = await buildChildren(narrowerMetadata);
    const node = generateNode(narrowerMetadata);
    node.children = narrowerChildren;
    children.push(node);
  }
  return children;
}

const buildKeywordTree = async metadata => {
  const node = generateNode(metadata);
  // if node.parentId is null remove the key from the object
  if (node.parentId === null) {
    delete node.parentId;
  }
  node.children = await buildChildren(metadata);
  return [node];
};

function buildConfig(metadata) {
  return {
    citation: {
      date: [
        {
          date: dayjs(metadata.conceptData.schemeVersion).format(
            'YYYY-MM-DDTHH:mm:ss'
          ),
          dateType: 'revision'
        }
      ],
      description: metadata.description || 'No description available.',
      title: `Global Change Master Directory (GCMD) ${metadata.conceptData.prefLabel}`,
      edition: `Version ${metadata.conceptData.keywordVersion}`,
      onlineResource: [
        {
          uri: `${baseUrl}concept/${metadata.conceptData.uuid}?format=json`
        }
      ],
      identifier: [
        {
          identifier: metadata.conceptData.uuid
        }
      ]
    },
    label: metadata.conceptData.prefLabel,
    keywordsUrl: `https://cdn.jsdelivr.net/gh/USGS-NGGDPP/mdEditor-keywords@main/resources/keywords/gcmd-${metadata.id}.json`
  };
}

async function generateKeywords(vocabulary) {
  const metadata = await loadMetadata(vocabulary);
  const keywordsJson = await buildKeywordTree(metadata);
  return keywordsJson;
}

async function generateThesaurusConfig(vocabulary) {
  const metadata = await loadMetadata(vocabulary);
  const config = buildConfig(metadata);
  return config;
}

export default async function main() {
  for (let i = 0; i < vocabularies.length; i++) {
    const vocabulary = vocabularies[i];
    console.log('processing vocabulary', vocabulary.id);
    const thesaurusConfig = await generateThesaurusConfig(vocabulary);
    const keywords = await generateKeywords(vocabulary);
    writeToLocalFile(
      thesaurusConfig,
      `${thesaurusPath}gcmd-${vocabulary.id}.json`
    );
    writeToLocalFile(keywords, `${keywordsPath}gcmd-${vocabulary.id}.json`);
  }
}
