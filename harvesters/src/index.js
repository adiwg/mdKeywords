const axios = require('axios');
const sciencebase = require('./sciencebase');
const usgs = require('./usgs');
const gcmd = require('./gcmd');
const { loadConfig, writeToLocalFile } = require('./utils');

const CONF_JSON = 'conf/index.json';
const { profilesListUrl } = loadConfig(CONF_JSON);

function isValidVocabulary(vocabulary) {
  if (!vocabulary.source || vocabulary.source === '') return false;
  if (!vocabulary.id || vocabulary.id === '') return false;
  return true;
}

async function processVocabulary(vocabulary) {
  console.log('\nProcessing vocabulary', vocabulary);
  switch (vocabulary.source) {
    case 'sciencebase':
      return await sciencebase.generateKeywordsFile(vocabulary).catch((err) => {
        console.log('Error generating ScienceBase keyword file', err);
      });
    case 'usgs':
      return await usgs.generateKeywordsFile(vocabulary);
    case 'gcmd':
      return await gcmd.generateKeywordsFile(vocabulary);
    default:
      console.log('Error: bad source type');
      return null;
  }
}

async function compileVocabulariesFromProfiles(profiles) {
  const promises = [];
  profiles.forEach((profile) => {
    promises.push(axios.get(profile.url));
  });
  return Promise.all(promises).then((responses) => {
    const compiledVocabularies = [];
    responses.forEach((response) => {
      const { vocabularies } = response.data;
      if (vocabularies) {
        vocabularies.forEach((vocabulary) => {
          if (
            isValidVocabulary(vocabulary) &&
            !compiledVocabularies.some((el) => el.id === vocabulary.id)
          ) {
            compiledVocabularies.push(vocabulary);
          }
        });
      }
    });
    return compiledVocabularies;
  });
}

async function loadProfiles(profilesListUrl) {
  const profilesResponse = await axios.get(profilesListUrl);
  return profilesResponse.data;
}

async function main() {
  const vocabularyCitations = [];
  const profiles = await loadProfiles(profilesListUrl);
  const vocabularies = await compileVocabulariesFromProfiles(profiles);
  for (const vocabulary of vocabularies) {
    const citation = await processVocabulary(vocabulary);
    if (citation) {
      vocabularyCitations.push(citation);
    }
    console.log('Successfully completed', vocabulary.name);
  }
  const outputFilename = 'vocabularies-auto.json';
  const outputFilePath = 'resources';
  writeToLocalFile(vocabularyCitations, outputFilename, outputFilePath);
  console.log(
    'Finished processing all vocabularies. New citations file saved to',
    outputFilename
  );
}

main();
