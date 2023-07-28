const gcmd = require('./gcmd');
const { loadConfig, writeToLocalFile, sleep } = require('./utils');

const CONF_JSON = 'conf/gcmd-all.json';
const { vocabulariesFilename, vocabulariesOutputFilename, outputFilePath } =
  loadConfig(CONF_JSON);

async function generateCitations(vocabularies) {
  const citations = [];
  for (const vocabulary of vocabularies) {
    await sleep(50);
    try {
      citations.push(await gcmd.generateCitation(vocabulary));
    } catch (err) {
      console.log(
        'ERROR: failed to generate citation for',
        vocabulary.id,
        err.code
      );
    }
  }
  return citations;
}

async function processVocabulary(vocabulary) {
  await sleep(50);
  console.log('\nProcessing vocabulary', vocabulary.id);
  try {
    return await gcmd.generateKeywordsFile(vocabulary);
  } catch (err) {
    console.log('ERROR: failed to process vocabulary', vocabulary.id, err.code);
    return null;
  }
}

async function main() {
  const { vocabularies } = loadConfig(`conf/${vocabulariesFilename}`);
  const vocabularyCitations = await generateCitations(vocabularies);
  writeToLocalFile(
    vocabularyCitations,
    vocabulariesOutputFilename,
    outputFilePath
  );
  for (const vocabulary of vocabularies) {
    await processVocabulary(vocabulary);
  }
  console.log('Vocabulary files saved to:', outputFilePath);
}

main();
