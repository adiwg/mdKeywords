const path = require('path');

const sciencebase = require('./sciencebase');
const usgs = require('./usgs');
const gcmd = require('./gcmd');
const { loadConfig, writeToLocalFile } = require('./utils');

async function loadVocabulariesFromFile(filename) {
  const vocabulariesFilePath = path.join('conf', filename);
  const { vocabularies } = loadConfig(vocabulariesFilePath);
  return vocabularies;
}

async function loadVocabularies(config) {
  let sbVocabularies = await loadVocabulariesFromFile(
    config.sciencebase.filename
  );
  sbVocabularies = sbVocabularies.map((vocabulary) => ({
    ...vocabulary,
    source: 'sciencebase',
  }));
  let gcmdVocabularies = await loadVocabulariesFromFile(config.gcmd.filename);
  gcmdVocabularies = gcmdVocabularies.map((vocabulary) => ({
    ...vocabulary,
    source: 'gcmd',
  }));
  let usgsVocabularies = config.usgs.vocabularies;
  usgsVocabularies = usgsVocabularies.map((vocabulary) => ({
    ...vocabulary,
    source: 'usgs',
  }));
  const vocabularies = [
    ...sbVocabularies,
    ...gcmdVocabularies,
    ...usgsVocabularies,
  ];
  return vocabularies;
}

async function buildManifest(vocabularies, config) {
  const manifest = vocabularies.map((vocabulary) => ({
    name: vocabulary.name,
    url: `${config.baseUrl}${config.citationsPath}${vocabulary.source}-${vocabulary.id}.json`,
  }));
  return manifest;
}

async function buildThesaurusConfig(vocabulary, config) {
  let thesaurusConfigFile;
  switch (vocabulary.source) {
    case 'sciencebase':
      thesaurusConfigFile = await sciencebase.generateCitation(vocabulary);
      break;
    case 'usgs':
      thesaurusConfigFile = await usgs.generateCitation(vocabulary);
      break;
    case 'gcmd':
      thesaurusConfigFile = await gcmd.generateCitation(vocabulary);
      break;
    default:
      throw new Error('Bad source type');
  }
  thesaurusConfigFile.keywordsUrl = `${config.baseUrl}${config.keywordsPath}${vocabulary.source}-${vocabulary.id}.json`;
  return thesaurusConfigFile;
}

async function buildKeywords(vocabulary) {
  let keywords;
  switch (vocabulary.source) {
    case 'sciencebase':
      keywords = await sciencebase.generateKeywords(vocabulary);
      break;
    case 'usgs':
      keywords = await usgs.generateKeywords(vocabulary);
      break;
    case 'gcmd':
      keywords = await gcmd.generateKeywords(vocabulary);
      break;
    default:
      throw new Error('Bad source type');
  }
  return keywords;
}

async function main() {
  // load configuration
  const config = loadConfig('conf/main.json');

  // load list of vocabularies
  console.log('Loading vocabularies');
  const vocabularies = await loadVocabularies(config);

  // generate manifest file
  console.log('Building manifest file');
  const manifest = await buildManifest(vocabularies, config);
  writeToLocalFile(manifest, config.manifestPath);

  for (let i = 0; i < vocabularies.length; i++) {
    // for each vocabulary create thesaurus configuration file
    const vocabulary = vocabularies[i];
    console.log('processing vocabulary', vocabulary.id);
    const configData = await buildThesaurusConfig(vocabulary, config);
    writeToLocalFile(
      configData,
      `${config.citationsPath}/${vocabulary.source}-${vocabulary.id}.json`
    );
    // for each vocabulary create keywords file
    const keywords = await buildKeywords(vocabulary);
    writeToLocalFile(
      keywords,
      `${config.keywordsPath}/${vocabulary.source}-${vocabulary.id}.json`
    );
  }
}

main();
