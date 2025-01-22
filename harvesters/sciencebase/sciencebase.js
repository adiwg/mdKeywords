import axios from 'axios';
import { sleep, writeToLocalFile } from '../utils';
import dayjs from 'dayjs';

import vocabularies from './vocabularies.json';

const baseUrl = 'https://www.sciencebase.gov/vocab';
const thesaurusPath = 'resources/thesaurus/';
const keywordsPath = 'resources/keywords/';

const getNode = async (parentId, nodeType) => {
  let params = {
    parentId,
    nodeType,
    max: 10,
    offset: 0,
    format: 'json'
  };
  const response = await axios
    .get(`${baseUrl}/categories/get`, { params })
    .then(response => response.data)
    .catch(error => {
      console.log('Error getting node', error);
    });
  const total = response.total;
  let list = response.list;
  while (list.length < total) {
    await sleep(1500);
    params.offset += 10;
    const nextResponse = await axios
      .get(`${baseUrl}/categories/get`, {
        params
      })
      .catch(error => {
        console.log('Error getting next page', error);
      });
    list = list.concat(nextResponse.data.list);
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
        children: terms
      });
      const termNode = await getNode(item.id, 'term');
      for (const termItem of termNode.list) {
        terms.push({
          uuid: termItem.id,
          parentId: item.id,
          label: termItem.name,
          definition: termItem.description || ''
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
        children
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
    format: 'json'
  };
  const metadata = await axios
    .get(`${baseUrl}/vocabulary/${id}`, { params })
    .then(response => response.data);
  return metadata;
}

function buildConfig(metadata) {
  return {
    citation: {
      date: [
        {
          date: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
          dateType: 'lastUpdate'
        }
      ],
      description: metadata.description || '',
      title: metadata.name,
      edition: '',
      onlineResource: [
        {
          uri: metadata.uri
        }
      ],
      identifier: [
        {
          identifier: metadata.id
        }
      ]
    },
    label: metadata.label || metadata.name || '',
    keywordsUrl: `https://cdn.jsdelivr.net/gh/USGS-NGGDPP/mdEditor-keywords@main/resources/keywords/sb-${metadata.id}.json`
  };
}

async function generateKeywords(vocabulary) {
  const { id: sciencebaseId } = vocabulary;
  console.log(`Generating keywords for ${sciencebaseId}`);
  const keywords = await buildTree(sciencebaseId);
  return keywords;
}

async function generateThesaurusConfig(vocabulary) {
  const { id } = vocabulary;
  console.log(`Generating config for ${id}`);
  const metadata = await loadMetadataFromId(id);
  return buildConfig(metadata);
}

export default async function main() {
  for (let i = 0; i < vocabularies.length; i++) {
    await sleep(5000);
    const vocabulary = vocabularies[i];
    console.log('processing vocabulary', vocabulary.id);
    const thesaurusConfig = await generateThesaurusConfig(vocabulary);
    const keywords = await generateKeywords(vocabulary);
    writeToLocalFile(
      thesaurusConfig,
      `${thesaurusPath}sb-${vocabulary.id}.json`
    );
    writeToLocalFile(keywords, `${keywordsPath}sb-${vocabulary.id}.json`);
  }
}
