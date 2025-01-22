const fs = require('fs-extra');

const copySchemas = async () => {
  await fs.copy('./schemas', './dist/schemas');
};

copySchemas();
