import fs from 'fs-extra';
import path from 'path';
import validator from './validator.js';

const keywordsDir = path.join(__dirname, '../../resources/keywords/');

describe('Keywords Validation', () => {
  const keywordFiles = fs.readdirSync(keywordsDir);

  keywordFiles.forEach(file => {
    test(`validates ${file}`, () => {
      const keywords = require(path.join(keywordsDir, file));
      const valid = validator.validate('keyword', keywords);

      if (!valid) {
        console.log(validator.errors);
      }

      expect(valid).toBe(true);
    });
  });
});
