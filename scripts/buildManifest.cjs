// Scan the resources/thesaurus directory for thesaurus files and for each file add an entry to the manifest
// The manifest schema contains a name and a url.
// The name should come from the `label` field in the object in the thesaurus file.
// The url should be generated based on the thesaurus file name and the base URL.
// The base url is https://cdn.jsdelivr.net/gh/USGS-NGGDPP/mdEditor-keywords@main/resources/thesaurus/

const fs = require('fs');
const path = require('path');

const thesaurusDir = path.join(__dirname, '../resources/thesaurus/');
const thesaurusBaseUrl =
  'https://cdn.jsdelivr.net/gh/USGS-NGGDPP/mdEditor-keywords@main/resources/thesaurus/';

const thesaurusFiles = fs.readdirSync(thesaurusDir);

const manifest = thesaurusFiles.map(file => {
  const thesaurus = require(path.join(thesaurusDir, file));
  return {
    name: thesaurus.label,
    url: `${thesaurusBaseUrl}${file}`
  };
});

fs.writeFileSync(
  path.join(__dirname, '../resources/manifest.json'),
  JSON.stringify(manifest, null, 2)
);

/** SAVE THIS CODE
 * This code produces the devManifest.json file which is used for testing the thesaurus files in a "dev" branch.
 * This can be useful for testing the thesaurus files before merging them into the main branch.
 */
// const devUrl =
//   'https://cdn.jsdelivr.net/gh/USGS-NGGDPP/mdEditor-keywords@dev/resources/thesaurus/';
// const devManifest = thesaurusFiles.map(file => {
//   const thesaurus = require(path.join(thesaurusDir, file));
//   return {
//     name: thesaurus.label,
//     url: `${devUrl}${file}`
//   };
// });
// 
// fs.writeFileSync(
//   path.join(__dirname, '../resources/devManifest.json'),
//   JSON.stringify(devManifest, null, 2)
// );

console.log('Manifest generated successfully');
