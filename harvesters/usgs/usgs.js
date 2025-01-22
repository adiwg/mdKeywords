import dayjs from 'dayjs';
import axios from 'axios';

import { sleep, writeToLocalFile } from '../utils';
import config from './config.json';

const {
  BASE_REPO_URL,
  BASE_URL,
  KEYWORDS_DIR,
  TERM,
  THESAURUS,
  THESAURUS_DIR
} = config;

const TIME_DELAY = 2000;

async function getThesaurus(thcode) {
  const thesaurusUrl = `${BASE_URL}${THESAURUS}?thcode=${thcode}`;
  const getThesaurusResponse = await axios.get(thesaurusUrl);
  if (getThesaurusResponse.status !== 200) {
    throw new Error(
      `Failed to fetch thesaurus: ${getThesaurusResponse.status}: ${getThesaurusResponse.statusText}`
    );
  }
  if (!getThesaurusResponse.data || !getThesaurusResponse.data.vocabulary) {
    throw new Error('No vocabulary found');
  }
  return getThesaurusResponse.data.vocabulary;
}

async function getTerm(thcode, code) {
  const TERM_DELAY = 50;
  const termUrl = `${BASE_URL}${TERM}?thcode=${thcode}&code=${code}`;
  let term;
  sleep(TERM_DELAY);
  try {
    term = await axios.get(termUrl);
    if (term.status !== 200) {
      sleep(TIME_DELAY);
      term = await axios.get(termUrl);
      if (term.status !== 200) {
        throw new Error(
          `Failed to fetch term ${code}: ${term.status}: ${term.statusText}`
        );
      }
    }
    if (!term.data) {
      throw new Error(`No term ${code} found`);
    }
    return term.data;
  } catch (e) {
    console.log('term error', code);
    sleep(TIME_DELAY);
    term = await axios.get(termUrl);
    if (term.status !== 200) {
      throw new Error(
        `Failed to fetch term ${code}: ${term.status}: ${term.statusText}`
      );
    }
    if (!term.data) {
      throw new Error(`No term ${code} found`);
    }
    return term.data;
  }
}

function createNode(term) {
  return {
    uuid: term.code,
    label: term.name,
    definition: term.scope || '',
    children: []
  };
}

async function buildTree(node, thcode) {
  if (!node.nt || node.nt.length === 0) {
    return [];
  }
  const childrenRequests = [];
  for (const child of node.nt) {
    const request = await getTerm(thcode, child.code);
    childrenRequests.push(request);
  }
  const childrenKeywords = [];
  for (const response of childrenRequests) {
    const childNode = createNode(response.term);
    childNode.children = await buildTree(response, thcode);
    childrenKeywords.push(childNode);
  }
  return childrenKeywords;
}

async function generateKeywords(name, thcode, root_code) {
  console.log('Building vocabulary:', name);
  const root = await getTerm(thcode, root_code);
  const rootKeyword = createNode(root.term);
  rootKeyword.label = name;
  rootKeyword.children = await buildTree(root, thcode);
  return rootKeyword;
}

function generateThesaurusConfig(thesaurus, filename) {
  console.log('Generating thesaurus config');
  if (!thesaurus.name) {
    throw new Error('Thesaurus name is required');
  }
  if (!filename) {
    throw new Error('Keywords URL is required');
  }
  return {
    citation: {
      date: [
        {
          date: dayjs(thesaurus.date).format('YYYY-MM-DDTHH:mm:ssZ'),
          dateType: 'revision'
        }
      ],
      description: thesaurus.scope || 'No description available',
      title: thesaurus.name,
      edition: thesaurus.edition || '',
      onlineResource: [
        {
          uri: thesaurus.uri || ''
        }
      ],
      identifier: [
        {
          identifier: thesaurus.thcode
        }
      ]
    },
    label: thesaurus.name,
    keywordsUrl: `${BASE_REPO_URL}/${KEYWORDS_DIR}/${filename}`
  };
}

async function harvestVocabulary(thcode) {
  const thesaurus = await getThesaurus(thcode);
  const { name, root_code, prefix } = thesaurus;
  const filename = `usgs-${thcode}-${prefix}.json`;
  const keywords = [await generateKeywords(name, thcode, root_code)];
  writeToLocalFile(keywords, `${KEYWORDS_DIR}/${filename}`);
  const thesaurusConfig = generateThesaurusConfig(thesaurus, filename);
  writeToLocalFile(thesaurusConfig, `${THESAURUS_DIR}/${filename}`);
}

async function getAllThesauri() {
  const thesauri = await axios.get(`${BASE_URL}${THESAURUS}`);
  if (thesauri.status !== 200) {
    throw new Error(
      `Failed to fetch thesauri: ${thesauri.status}: ${thesauri.statusText}`
    );
  }
  if (!thesauri.data || !thesauri.data.vocabulary) {
    throw new Error('No vocabulary found');
  }
  return thesauri.data.vocabulary;
}

export default async function main() {
  try {
    const thesauri = await getAllThesauri();
    for (const thesaurus of thesauri) {
      console.log('Thesaurus:', thesaurus.thcode);
      await harvestVocabulary(thesaurus.thcode);
      console.log('Harvesting complete');
      sleep(TIME_DELAY);
    }
    // await harvestVocabulary('1');
  } catch (error) {
    console.error('Error harvesting:', error);
  }
}
