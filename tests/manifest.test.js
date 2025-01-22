import fs from 'fs-extra';
import path from 'path';
import validator from './validator.js';

import manifest from '../../resources/manifest.json';

describe('Manifest Tests', () => {
  test('Manifest follows the schema', () => {
    const valid = validator.validate('manifest', manifest);
    if (!valid) {
      console.log(validator.errors);
    }
    expect(valid).toBe(true);
  });

  test('Files exist for all URLs in the manifest', () => {
    manifest.forEach(item => {
      const fileName = item.url.split('resources/')[1];
      const filePath = path.join(__dirname, '../../resources', fileName);
      const fileExists = fs.existsSync(filePath);
      if (!fileExists) {
        console.log(`File does not exist: ${fileName}`);
      }
      expect(fileExists).toBe(true);
    });
  });
});
