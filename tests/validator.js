import addFormats from 'ajv-formats';
import Ajv2020 from 'ajv/dist/2020.js';

import { keyword, manifest, thesaurusConfig } from '../schemas/index.js';

const validator = new Ajv2020();
addFormats(validator);

const schemas = {
  keyword,
  manifest,
  thesaurusConfig
};

Object.entries(schemas).forEach(([key, schema]) => {
  if (!validator.validateSchema(schema)) {
    console.error(`Invalid schema: ${key}`);
    console.error(validator.errors);
  } else {
    validator.addSchema(schema, key);
  }
});

export default validator;
