const fs = require('fs');
const path = require('path');

/**
 * Loads the configuration from a given file.
 *
 * @param {string} configFilename - The path to the configuration file.
 * @returns {Object} The parsed configuration object.
 * @throws {Error} If the file does not exist or is not a valid JSON file.
 */
const loadConfig = (configFilename) => {
    console.log('Loading config from', configFilename);
    const configData = fs.readFileSync(configFilename, 'utf-8');
    return JSON.parse(configData);
};

/**
 * Loads a list of vocabularies from a file.
 * @returns {Promise<Array>}
 * @private
 * @async
 * @throws {Error} If the file does not exist.
 * @throws {Error} If the file is not a valid JSON file.
 * @throws {Error} If the file does not contain an array.
 * @throws {Error} If the file does not contain any vocabulary.
 * @throws {Error} If the file contains a vocabulary without an id.
 * @throws {Error} If the file contains a vocabulary without a name.
 */
async function loadVocabulariesFromFile(filename) {
    const vocabulariesFilePath = path.join(__dirname, 'conf', filename);
    const vocabulariesFile = fs.readFileSync(vocabulariesFilePath, 'utf8');
    const {vocabularies} = JSON.parse(vocabulariesFile);

    if (!Array.isArray(vocabularies)) {
        throw new Error('The file does not contain an array.');
    }

    if (vocabularies.length === 0) {
        throw new Error('The file does not contain any vocabulary.');
    }

    for (const vocabulary of vocabularies) {
        if (!vocabulary.hasOwnProperty('id')) {
            throw new Error('The file contains a vocabulary without an id.');
        }
        if (!vocabulary.hasOwnProperty('name')) {
            throw new Error('The file contains a vocabulary without a name.');
        }
    }

    return vocabularies;
}

/**
 * Generates a manifest file.
 *
 * @param {Array} vocabularies - The vocabularies to be used in the manifest file.
 * @returns {Promise<void>}
 */
async function generateManifest(vocabularies) {
    const vocabularyConfig = vocabularies.map(vocabulary => ({
        id: vocabulary.id,
        name: vocabulary.name,
        source,
        citationUrl: `resources/configs/${source}-${vocabulary.id}.json`,
        keywordsUrl: `resources/keywords/${source}-${vocabulary.id}.json`
    }));

    const manifestFilePath = path.join(__dirname, 'resources', 'manifest.json');
    fs.writeFileSync(manifestFilePath, JSON.stringify(vocabularyConfig, null, 2));
}

/**
 * Main function to collect all vocabularies, generate manifest file,
 * create thesaurus configuration file and keywords file for each vocabulary.
 *
 * @returns {Promise<void>}
 */
async function main() {
    // load list of vocabularies
    const vocabularies = await loadVocabularies();
    // generate manifest file
    await generateManifest(vocabularies);
    // for each vocabulary create thesaurus configuration file
    // for each vocabulary create keywords file
}

main();