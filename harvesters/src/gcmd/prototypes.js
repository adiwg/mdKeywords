const KeywordPrototype = {
  uuid: '',
  label: '',
  broader: '',
  definition: '',
  children: [],
};

const CategoryPrototype = {
  id: null,
  label: null,
  collapseEmptyCells: null,
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

module.exports = { KeywordPrototype, CategoryPrototype };
