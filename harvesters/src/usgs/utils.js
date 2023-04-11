const fs = require("fs");

// Requires type to be either 'local' or 'url' to be valid
function invalidType(type) {
  switch (type) {
    case "local":
      return false;
    case "url":
      return false;
    default:
      return true;
  }
}

// Takes a json object and save it as <filename> to the thesauri directory
function writeToLocalFile(jsonData, filename = "usgs-thesaurus.json") {
  console.log("Saving to", filename);
  fs.writeFileSync(`thesauri/${filename}`, JSON.stringify(jsonData, null, 2));
  console.log(`Completed successfully, file saved to thesauri/${filename}`);
}

module.exports = { invalidType, writeToLocalFile };
