const fs = require('fs-extra');

const copyGnisData = async () => {
  const srcDir = './harvesters/gnis/data';
  const destDir = './dist/harvesters/gnis/data';

  try {
    const exists = await fs.pathExists(srcDir);
    if (exists) {
      await fs.copy(srcDir, destDir);
      console.log('Data copied successfully.');
    } else {
      console.log(
        `Source directory "${srcDir}" does not exist. Skipping copy.`
      );
    }
  } catch (error) {
    console.error('Error copying data:', error);
  }
};

copyGnisData();
