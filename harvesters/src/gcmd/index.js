/*global process */
// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config({ path: 'src/gcmd/.env' });
const axios = require('axios');
const { loadConfig, sleep } = require('../utils');
const {
  hasError,
  isPrimaryCell,
  parseMeta,
  saveJsonToFile,
} = require('./utils');
const { KeywordPrototype, CategoryPrototype } = require('./prototypes');
const { ceil } = require('lodash');

const { CONF_JSON } = process.env;
const { CATEGORY_URL, OUTPUT_FILENAME_PREFIX, CATEGORIES } =
  loadConfig(CONF_JSON);

async function loadCategoryPage(id, pageNumber) {
  const categoryPage = Object.create(CategoryPrototype);
  const { pageSize } = categoryPage;
  const pageUrl = `${CATEGORY_URL}${id}/?format=csv&page_num=${pageNumber}&page_size=${pageSize}`;
  console.log('Loading keywords from', pageUrl);
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
    categoryPage.hits = hits;
    categoryPage.pageNum = parseInt(parseMeta(categoryMetaData[1]));
    categoryPage.totalPages = ceil(hits / pageSize);
    categoryPage.version = parseMeta(categoryMetaData[3]);
    categoryPage.revision = parseMeta(categoryMetaData[4]);
    categoryPage.timestamp = parseMeta(categoryMetaData[5]);
    categoryPage.terms = parseMeta(categoryMetaData[6]);
    categoryPage.xmlUrl = parseMeta(categoryMetaData[7]);
    categoryPage.headers = categoryHeaders;
    const newKeywords = [];
    keywordLinesRaw.forEach((line) => {
      const words = line.split(',');
      if (words.length > 1) {
        const newLine = {};
        categoryHeaders.forEach((header, i) => {
          newLine[header] = words[i].replace(/"/g, '');
        });
        newKeywords.push(newLine);
      }
    });
    categoryPage.keywords = newKeywords;
  }
  return categoryPage;
}

async function loadCategory(categoryRaw) {
  const { id: categoryId, label, collapseEmptyCells } = categoryRaw;
  let pageNumber = 1;
  const category = await loadCategoryPage(categoryId, pageNumber);
  category.id = categoryId;
  category.label = label;
  category.collapseEmptyCells = collapseEmptyCells;
  const { totalPages } = category;
  if (totalPages > 1) {
    while (pageNumber < totalPages) {
      await sleep(1000);
      pageNumber += 1;
      const nextPage = await loadCategoryPage(categoryRaw.id, pageNumber);
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
  console.log('Building keyword tree', label);
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
  console.log('tree', tree);
  return tree.children;
}

async function generateKeywordsJson(categoryRaw) {
  const category = await loadCategory(categoryRaw);
  const keywordsJson = await buildKeywordTree(category);
  if (keywordsJson)
    saveJsonToFile(categoryRaw.id, keywordsJson, OUTPUT_FILENAME_PREFIX);
}

async function main() {
  console.log('Generating JSON files for:');
  CATEGORIES.forEach((category) => {
    console.log(` * ${category.label}`);
  });
  for (const categoryRaw of CATEGORIES) {
    if (categoryRaw.enabled) {
      console.log(categoryRaw.label.toUpperCase());
      await generateKeywordsJson(categoryRaw);
    } else {
      console.log('Skipped:', categoryRaw.label.toUpperCase());
    }
  }
}

main();
