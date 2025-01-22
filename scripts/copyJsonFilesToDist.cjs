const fs = require('fs-extra');
const path = require('path');

const copyJsonFilesToDist = async () => {
  const srcDir = './harvesters';
  const destDir = './dist/harvesters';

  const copyFiles = async (dir, dest) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(dir, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyFiles(srcPath, destPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.json') {
        await fs.copy(srcPath, destPath);
      }
    }
  };

  await copyFiles(srcDir, destDir);
};

copyJsonFilesToDist()
  .then(() => console.log('JSON files copied successfully'))
  .catch(err => console.error('Error copying JSON files:', err));
