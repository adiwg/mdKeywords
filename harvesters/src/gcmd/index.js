const dotenv = require("dotenv").config({ path: "src/gcmd/.env" });
const axios = require("axios");
const { writeToLocalFile } = require("../usgs/utils");
const { ceil } = require("lodash");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const {
  CATEGORY_URL,
  COLLAPSE_EMPTY_CELLS,
  GCMD_BY_CATEGORY_URL,
  OUTPUT_FILENAME_PREFIX,
} = process.env;

const KeywordPrototype = {
  uuid: "",
  label: "",
  broader: "",
  definition: "",
  children: [],
};

const CategoryPrototype = {
  id: null,
  label: null,
  hits: null,
  pageNum: null,
  totalPages: null,
  pageSize: 2000,
  version: null,
  revision: null,
  timestamp: null,
  terms: null,
  xmlUrl: null,
  caseNative: true,
  headers: [],
  keywords: [],
};

async function loadCategories(url) {
  console.log("Retrieving list of GCMD Keywords by Category from", url);
  const response = await axios.get(url).catch((err) => {
    console.log("Error retrieving list of categories", err);
    process.exit(1);
  });
  if (response.error) {
    console.log("Response Error:", response.error);
    process.exit(1);
  }
  if (response.data) {
    const categories = response.data;
    return categories;
  }
  return null;
}

function parseMeta(data) {
  return data.split(/:(.*)/s)[1].replace('"', "").replace(/ /s, "");
}

async function loadCategoryPage(id, pageNumber) {
  const categoryPage = Object.create(CategoryPrototype);
  const { pageSize } = categoryPage;
  const pageUrl = `${CATEGORY_URL}${id}/?format=csv&page_num=${pageNumber}&page_size=${pageSize}`;
  console.log("Loading keywords from", pageUrl);
  const response = await axios.get(pageUrl).catch((err) => {
    console.log("Error loading keywords", pageUrl);
    return;
  });
  if (response.error) {
    console.log("Response Error:", response.error);
    return;
  }
  if (response.data) {
    const lines = response.data.split("\n");
    const categoryMetaData = lines[0].split(",");
    const categoryHeaders = lines[1].split(",");
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
      const words = line.split(",");
      if (words.length > 1) {
        const newLine = {};
        categoryHeaders.forEach((header, i) => {
          newLine[header] = words[i].replace(/"/g, "");
        });
        newKeywords.push(newLine);
      }
    });
    categoryPage.keywords = newKeywords;
  }
  return categoryPage;
}

async function loadCategory(categoryRaw) {
  let pageNumber = 1;
  const category = await loadCategoryPage(categoryRaw.id, pageNumber);
  category.id = categoryRaw.id;
  category.label = categoryRaw.label;
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

// Primary cell is the cell associated with the UUID
function isPrimaryCell(keyword, headers, headerIndex) {
  const nextHeader = headers[headerIndex + 1];
  const nextLabel = keyword[nextHeader];
  if (nextHeader === "UUID") {
    return true;
  }
  if (nextLabel === "") {
    return isPrimaryCell(keyword, headers, headerIndex + 1);
  }
  return false;
}

function hasError(currentHeader, headerIndex, headersLength) {
  return currentHeader === "UUID" || headerIndex >= headersLength;
}

function generateChildChain(node, keyword, headers, headerIndex) {
  const currentHeader = headers[headerIndex];
  const currentLabel = keyword[currentHeader];
  if (hasError(currentHeader, headerIndex, headers.length)) {
    console.log("Error: generateChildChain called on invalid column");
    if (currentHeader === "UUID") {
      console.log('Error: currentHeader === "UUID"');
    }
    if (headerIndex >= headers.length) {
      console.log("Error: headerIndex >= headers.length");
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
  if (COLLAPSE_EMPTY_CELLS === "true" && currentLabel === "") {
    return [...node.children, ...newChildNode.children];
  }
  return [...node.children, newChildNode];
}

async function upsertKeyword(tree, keyword, headers) {
  const { node, headerIndex } = findNode(tree, keyword, headers, 0);
  if (
    node.label === keyword[headers[headerIndex - 1]] &&
    keyword[headers[headerIndex]] === ""
  ) {
    node.uuid = keyword.UUID;
  } else {
    node.children = await generateChildChain(
      node,
      keyword,
      headers,
      headerIndex
    );
  }
  if (node.children === null) {
    return "ERROR";
  }
  return "OK";
}

async function buildKeywordTree(category) {
  const { id, label, headers, keywords } = category;
  console.log("Building keyword tree", label);
  const tree = {
    id,
    label,
    headers,
    children: [],
  };
  let status = "OK";
  for (const keyword of keywords) {
    status = await upsertKeyword(tree, keyword, headers);
    if (status === "ERROR") break;
  }
  if (status === "ERROR") return null;
  console.log("tree", tree);
  return tree.children;
}

function saveJsonToFile(id, json) {
  const filename = `${OUTPUT_FILENAME_PREFIX}${id}.json`;
  writeToLocalFile(json, filename);
}

async function generateKeywordsJson(categoryRaw) {
  const category = await loadCategory(categoryRaw);
  const keywordsJson = await buildKeywordTree(category);
  if (keywordsJson) saveJsonToFile(categoryRaw.id, keywordsJson);
}

async function main() {
  const categories = await loadCategories(GCMD_BY_CATEGORY_URL);
  if (!categories) {
    console.log("Error loading categories");
    process.exit(1);
  }
  console.log("Generating JSON files for:");
  categories.forEach((category) => {
    console.log(` * ${category.label}`);
  });
  for (const category of categories) {
    console.log(category.label.toUpperCase());
    await generateKeywordsJson(category);
  }
}

main();
