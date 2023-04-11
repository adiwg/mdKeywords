const dotenv = require("dotenv").config({ path: "src/usgs/.env" });
const { default: axios } = require("axios");
const fs = require("fs");

const { throwError } = require("../utils");
const { invalidType, writeToLocalFile } = require("./utils");

const {
  SOURCE_TYPE,
  SOURCE_FILENAME,
  SOURCE_URL,
  OUTPUT_TYPE,
  OUTPUT_FILENAME,
  // OUTPUT_URL,
} = process.env;

const regex = /insert into term \(code,name,parent,scope\) values \((.*)\);$/gm;

const COLUMN = {
  CODE: 0,
  NAME: 1,
  PARENT: 2,
  SCOPE: 3,
};

const parseSql = (sqlData) => {
  let m;
  let results = [];
  while ((m = regex.exec(sqlData)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    results.push(
      eval(`[${m[1].replace(/NULL/g, '""').replace(/''/g, "\\'")}]`)
    );
  }
  return results;
};

const getRootNode = (parsedData) => {
  const rootIndex = parsedData.findIndex((node) => {
    return node[COLUMN.PARENT] === "";
  });
  return parsedData[rootIndex];
};

const findChildren = (data, parent) => {
  const results = [];
  data.forEach((node) => {
    if (node[COLUMN.PARENT] === parent) {
      results.push({
        uuid: node[COLUMN.CODE],
        label: node[COLUMN.NAME],
        definition: node[COLUMN.SCOPE],
        children: findChildren(data, node[COLUMN.CODE]),
      });
    }
  });
  return results;
};

const buildTree = (sqlData) => {
  const parsedData = parseSql(sqlData);
  const rootNode = getRootNode(parsedData);
  return findChildren(parsedData, rootNode[COLUMN.CODE]);
};

const saveTree = async (tree) => {
  if (OUTPUT_TYPE === "local") {
    writeToLocalFile(tree, OUTPUT_FILENAME);
  } else if (OUTPUT_TYPE === "url") {
    // TODO - BEGIN
    console.log("TODO save to url post route");
    process.exit(1);
    // TODO - Remove above to enable below
    // const response = await axios.post(OUTPUT_URL).catch((err) => {
    //   throwError(err);
    // });
    // TODO - END
  }
};

async function buildFromLocalFile() {
  const sqlData = fs.readFileSync(SOURCE_FILENAME);
  const tree = buildTree(sqlData);
  console.log("Build completed successfully.");
  saveTree(tree);
}

async function buildFromUrlSource() {
  const response = await axios.get(SOURCE_URL).catch((err) => {
    console.log("Error retrieving data from source", SOURCE_URL, err);
    process.exit(1);
  });
  const sqlData = response.data;
  const tree = buildTree(sqlData);
  console.log("Build completed successfully.");
  saveTree(tree);
}

function main() {
  if (invalidType(SOURCE_TYPE)) {
    throwError("SOURCE_TYPE is required and must be either 'local' or 'url'");
  }
  if (invalidType(OUTPUT_TYPE)) {
    throwError("OUTPUT_TYPE is required and must be either 'local' or 'url'");
  }
  if (SOURCE_TYPE === "local") {
    console.log(`Building locally from ${SOURCE_FILENAME} ...`);
    buildFromLocalFile();
  } else if (SOURCE_TYPE === "url") {
    console.log(`Building from URL source ${SOURCE_URL} ...`);
    buildFromUrlSource();
  }
}

main();
