const fs = require('fs');
const path = require('path');

const { loadConfig, writeToLocalFile } = require('./utils');

const sciencebase = require('./sciencebase');
const usgs = require('./usgs');
const gcmd = require('./gcmd');

async function loadVocabulariesFromFile(filename) {
  const vocabulariesFilePath = path.join('conf', filename);
  console.log('Loading vocabularies from', vocabulariesFilePath);
  const vocabulariesFile = fs.readFileSync(vocabulariesFilePath, 'utf8');
  const { vocabularies } = JSON.parse(vocabulariesFile);
  console.log('returning vocabularies');
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
    id: vocabulary.id,
    name: vocabulary.name,
    source: vocabulary.source,
    citationUrl: `${config.citationsPath}/${vocabulary.source}-${vocabulary.id}.json`,
    keywordsUrl: `${config.keywordsPath}/${vocabulary.source}-${vocabulary.id}.json`,
  }));
  return manifest;
}

async function buildThesaurusConfig(vocabulary) {
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
  console.log('config', config);
  // load list of vocabularies
  const vocabularies = await loadVocabularies(config);
  console.log('vocabularies loaded');
  // generate manifest file
  const manifest = await buildManifest(vocabularies, config);
  writeToLocalFile(manifest, config.manifestPath);
  for (let i = 0; i < vocabularies.length; i++) {
    // for each vocabulary create thesaurus configuration file
    const vocabulary = vocabularies[i];
    console.log('building thesaurus config for', vocabulary.id);
    const configData = await buildThesaurusConfig(vocabulary);
    writeToLocalFile(
      configData,
      `${config.citationsPath}/${vocabulary.source}-${vocabulary.id}.json`
    );
    // for each vocabulary create keywords file
    console.log('building keywords for', vocabulary.id);
    const keywords = await buildKeywords(vocabulary);
    writeToLocalFile(
      keywords,
      `${config.keywordsPath}/${vocabulary.source}-${vocabulary.id}.json`
    );
  }
}

main();
