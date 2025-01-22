import fs from 'fs-extra';
import path from 'path';
import validator from './validator.js';

const thesaurusDir = path.join(__dirname, '../../resources/thesaurus/');
const keywordBaseDir = path.join(__dirname, '../../resources/keywords/');

describe('Thesaurus Validation', () => {
  const thesaurusFiles = fs.readdirSync(thesaurusDir);

  thesaurusFiles.forEach(file => {
    test(`validates ${file}`, () => {
      const thesaurus = require(path.join(thesaurusDir, file));
      const valid = validator.validate('thesaurusConfig', thesaurus);

      if (!valid) {
        console.log(validator.errors);
      }

      expect(valid).toBe(true);

      if (thesaurus.keywordsUrl) {
        const keywordFileName = thesaurus.keywordsUrl.split(
          'resources/keywords/'
        )[1];
        const keywordFilePath = path.join(keywordBaseDir, keywordFileName);
        const keywordFileExists = fs.existsSync(keywordFilePath);

        if (!keywordFileExists) {
          console.log(`Keyword file does not exist: ${keywordFileName}`);
        }

        expect(keywordFileExists).toBe(true);
      }
    });
  });
});
