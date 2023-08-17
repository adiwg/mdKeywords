/* global process */
const axios = require('axios');
const sciencebase = require('./sciencebase');
const usgs = require('./usgs');
const gcmd = require('./gcmd');
const { loadConfig, writeToLocalFile, sleep } = require('./utils');

const CONF_JSON = 'conf/index.json';
const {
  defaultVocabulariesFilename,
  outputFilePath,
  profilesListUrl,
  vocabulariesFilename,
} = loadConfig(CONF_JSON);

async function loadProfiles(profilesListUrl) {
  const profilesResponse = await axios.get(profilesListUrl);
  const profiles = profilesResponse.data;
  return profiles;
}

function isValidVocabulary(vocabulary) {
  if (!vocabulary.source || vocabulary.source === '') return false;
  if (!vocabulary.id || vocabulary.id === '') return false;
  return true;
}

async function compileVocabulariesFromProfiles(profiles) {
  const promises = profiles.map((profile) => axios.get(profile.url));
  const responses = await Promise.all(promises);
  const vocabularies = responses.flatMap(
    (response) => response.data.vocabularies || []
  );
  const compiledVocabularies = vocabularies
    .filter(isValidVocabulary)
    .filter(
      (vocabulary, index, self) =>
        self.findIndex((v) => v.id === vocabulary.id) === index
    );
  return compiledVocabularies;
}

async function generateCitations(vocabularies) {
  const previousCitations = loadConfig(
    `../${outputFilePath}/${vocabulariesFilename}`
  );
  const citations = loadConfig(`conf/${defaultVocabulariesFilename}`);
  for (const vocabulary of vocabularies) {
    await sleep(500);
    const defaultCitation = citations.find(
      (c) => c.citation.identifier[0].identifier === vocabulary.id
    );
    if (defaultCitation) {
      console.log('Using default citation', vocabulary.id, vocabulary.name);
      continue;
    }
    console.log('Generating citation', vocabulary.id, vocabulary.name);
    const { source } = vocabulary;
    const generators = {
      sciencebase: sciencebase.generateCitation,
      usgs: usgs.generateCitation,
      gcmd: gcmd.generateCitation,
    };
    const generateCitation = generators[source];
    if (!generateCitation) {
      console.log('ERROR: bad source type');
      return null;
    }
    try {
      citations.push(await generateCitation(vocabulary));
    } catch (err) {
      console.log(
        `ERROR: failed to generate ${source} citation:`,
        vocabulary.name,
        err.code
      );
      const citation = previousCitations.find(
        (c) => c.citation.identifier[0].identifier === vocabulary.id
      );
      if (citation) {
        console.log('Using previous citation');
        citations.push(citation);
      }
    }
  }
  return citations;
}

async function processVocabulary(vocabulary) {
  await sleep(1000);
  console.log('\nProcessing vocabulary', vocabulary.id, vocabulary.name);
  const { source } = vocabulary;
  const generators = {
    sciencebase: sciencebase.generateKeywordsFile,
    usgs: usgs.generateKeywordsFile,
    gcmd: gcmd.generateKeywordsFile,
  };
  const generateKeywordsFile = generators[source];
  if (!generateKeywordsFile) {
    console.log('ERROR: bad source type');
    return null;
  }
  try {
    return await generateKeywordsFile(vocabulary);
  } catch (err) {
    console.log(
      `ERROR: failed to generate ${source} keyword file:`,
      vocabulary.name,
      err.code
    );
    return null;
  }
}

function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const argMap = {};
  for (const arg of args) {
    const [key, value] = arg.split('=');
    argMap[key] = value;
  }
  return argMap;
}

async function main() {
  const argMap = parseCommandLineArgs();
  console.log('command line args:', argMap);
  const profiles = await loadProfiles(profilesListUrl);
  let vocabularies = await compileVocabulariesFromProfiles(profiles);
  if (argMap.source) {
    console.log('Filtering vocabularies by source:', argMap.source);
    vocabularies = vocabularies.filter((v) => v.source === argMap.source);
  }
  const vocabularyCitations = await generateCitations(vocabularies);
  writeToLocalFile(vocabularyCitations, vocabulariesFilename, outputFilePath);
  for (const vocabulary of vocabularies) {
    await processVocabulary(vocabulary);
  }
  console.log('Vocabulary files saved to:', outputFilePath);
}

main();
