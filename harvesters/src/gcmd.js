const axios = require('axios');
const { loadConfig, sleep, writeToLocalFile } = require('./utils');
const { ceil } = require('lodash');

const CONF_JSON = 'conf/gcmd.json';
const { categoryUrl, keywordUrl, outputFileBaseUrl, outputFilePrefix } =
  loadConfig(CONF_JSON);

const KeywordPrototype = {
  uuid: null,
  parentId: null,
  label: null,
  definition: null,
  children: [],
};

const parseMeta = (data) =>
  data.split(/:(.*)/s)[1].replace('"', '').replace(/ /s, '');

// Primary cell is the cell associated with the UUID
function isPrimaryCell(keyword, headers, headerIndex) {
  const nextHeader = headers[headerIndex + 1];
  const nextLabel = keyword[nextHeader];
  if (nextHeader === 'UUID') {
    return true;
  }
  if (nextLabel === '') {
    return isPrimaryCell(keyword, headers, headerIndex + 1);
  }
  return false;
}

function hasError(currentHeader, headerIndex, headersLength) {
  return currentHeader === 'UUID' || headerIndex >= headersLength;
}

async function loadCategoryPage(id, pageNumber) {
  const pageSize = 2000;
  const pageUrl = `${categoryUrl}${id}/?format=csv&page_num=${pageNumber}&page_size=${pageSize}`;
  const response = await axios.get(pageUrl).catch((err) => {
    console.log('Error loading keywords', err);
    return;
  });
  if (response.error) {
    console.log('Response Error:', response.error);
    return;
  }
  if (response.data) {
    const lines = response.data.split('\n');
    const categoryMetaData = lines[0].split(',');
    const categoryHeaders = lines[1].split(',');
    const keywordLinesRaw = lines.slice(2);
    const hits = parseInt(parseMeta(categoryMetaData[0]));
    const pageNum = parseInt(parseMeta(categoryMetaData[1]));
    const totalPages = ceil(hits / pageSize);
    const version = parseMeta(categoryMetaData[3]);
    const revision = parseMeta(categoryMetaData[4]);
    const timestamp = parseMeta(categoryMetaData[5]);
    const terms = parseMeta(categoryMetaData[6]);
    const xmlUrl = parseMeta(categoryMetaData[7]);
    const headers = categoryHeaders;
    const keywords = keywordLinesRaw
      .filter((line) => line.split(',').length > 1)
      .map((line) => {
        const words = line.split(',');
        const newLine = {};
        categoryHeaders.forEach((header, i) => {
          newLine[header] = words[i].replace(/"/g, '');
        });
        return newLine;
      });
    return {
      id,
      hits,
      pageNum,
      totalPages,
      version,
      revision,
      timestamp,
      terms,
      xmlUrl,
      headers,
      keywords,
    };
  }
}

async function loadCategory(vocabulary) {
  const { id, name } = vocabulary;
  let pageNumber = 1;
  const metadata = await loadMetadata(vocabulary);
  const category = await loadCategoryPage(metadata.scheme, pageNumber);
  category.id = id;
  category.label = name;
  category.collapseEmptyCells =
    typeof vocabulary.collapseEmptyCells !== 'undefined'
      ? vocabulary.collapseEmptyCells
      : true;
  const { totalPages } = category;
  if (totalPages > 1) {
    while (pageNumber < totalPages) {
      await sleep(1000);
      pageNumber += 1;
      const nextPage = await loadCategoryPage(metadata.scheme, pageNumber);
      category.keywords.push(...nextPage.keywords);
    }
  }
  return category;
}

function findNode(node, keyword, headers, headerIndex) {
  const label = keyword[headers[headerIndex]];
  for (const currentNode of node.children) {
    if (currentNode.label === label) {
      return findNode(currentNode, keyword, headers, headerIndex + 1);
    }
  }
  return { node, headerIndex };
}

function generateChildChain(
  node,
  keyword,
  headers,
  headerIndex,
  collapseEmptyCells
) {
  const currentHeader = headers[headerIndex];
  const currentLabel = keyword[currentHeader];
  if (hasError(currentHeader, headerIndex, headers.length)) {
    console.log('Error: generateChildChain called on invalid column');
    if (currentHeader === 'UUID') {
      console.log('Error: currentHeader === "UUID"');
    }
    if (headerIndex >= headers.length) {
      console.log('Error: headerIndex >= headers.length');
    }
    return null;
  }
  const newChildNode = Object.create(KeywordPrototype);
  newChildNode.label = currentLabel;
  newChildNode.children = [];
  if (isPrimaryCell(keyword, headers, headerIndex)) {
    newChildNode.uuid = keyword.UUID;
  } else {
    newChildNode.children = generateChildChain(
      newChildNode,
      keyword,
      headers,
      headerIndex + 1
    );
    if (newChildNode.children === null) {
      return null;
    }
  }
  if (collapseEmptyCells && currentLabel === '') {
    return [...node.children, ...newChildNode.children];
  }
  return [...node.children, newChildNode];
}

async function upsertKeyword(tree, keyword, headers, collapseEmptyCells) {
  const { node, headerIndex } = findNode(tree, keyword, headers, 0);
  if (
    node.label === keyword[headers[headerIndex - 1]] &&
    keyword[headers[headerIndex]] === ''
  ) {
    node.uuid = keyword.UUID;
  } else {
    node.children = await generateChildChain(
      node,
      keyword,
      headers,
      headerIndex,
      collapseEmptyCells
    );
  }
  if (node.children === null) {
    return 'ERROR';
  }
  return 'OK';
}

async function buildKeywordTree(category) {
  const { id, label, collapseEmptyCells, headers, keywords } = category;
  const tree = {
    id,
    label,
    headers,
    children: [],
  };
  let status = 'OK';
  for (const keyword of keywords) {
    status = await upsertKeyword(tree, keyword, headers, collapseEmptyCells);
    if (status === 'ERROR') break;
  }
  if (status === 'ERROR') return null;
  return tree.children;
}

async function loadMetadata(vocabulary) {
  const { id } = vocabulary;
  const metadataUrl = `${keywordUrl}${id}`;
  const response = await axios.get(metadataUrl).catch((err) => {
    console.log('Error loading metadata', err);
    return;
  });
  if (response.error) {
    console.log('Response Error:', response.error);
    return;
  }
  if (response.data) {
    const metadata = response.data;
    return metadata;
  }
}

function generateCitationInternal(vocabulary, filename, metadata) {
  return {
    citation: {
      date: [
        {
          date: metadata.changeNotes[0].date,
          dateType: 'revision',
        },
      ],
      description: '',
      title: `Global Change Master Directory (GCMD) ${metadata.prefLabel}`,
      edition: `Version ${metadata.version}`,
      onlineResource: [
        {
          uri: `${categoryUrl}${metadata.scheme}`,
        },
      ],
      identifier: [
        {
          identifier: vocabulary.id,
        },
      ],
    },
    keywordType: metadata.scheme,
    label: vocabulary.name,
    dynamicLoad: true,
    keywordsUrl: `${outputFileBaseUrl}${filename}`,
    keywords: [],
  };
}

async function generateKeywordsFile(vocabulary) {
  const metadata = await loadMetadata(vocabulary);
  const category = await loadCategory(vocabulary);
  const keywordsJson = await buildKeywordTree(category);
  const filename = `${outputFilePrefix}${metadata.scheme}.json`;
  if (keywordsJson) writeToLocalFile(keywordsJson, filename);
}

async function generateCitation(vocabulary) {
  const metadata = await loadMetadata(vocabulary);
  const filename = `${outputFilePrefix}${metadata.scheme}.json`;
  return generateCitationInternal(vocabulary, filename, metadata);
}

module.exports = { generateCitation, generateKeywordsFile };
