const rimraf = require('rimraf');

const distPath = 'dist';

function clean() {
  console.log('Cleaning the dist directory:', distPath);
  rimraf.sync(distPath);
  console.log('Dist directory cleaned successfully!');
}

clean();
