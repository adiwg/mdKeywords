const dotenv = require("dotenv").config({ path: "src/sciencebase/.env" });
const fs = require("node:fs");
const uuid = require("uuid");

const { getNode, populateVocabulary, UUID_V5_NAMESPACE } = require("./utils");

const { BASE_URL, ROOT_NODES, OUTPUT_FILENAME_PREFIX } = process.env;
const rootNodeIds = JSON.parse(ROOT_NODES);

async function buildTree(baseId) {
  console.log("Building tree from", baseId);
  const rootNode = await getNode(baseId);
  let vocabulary = [];
  const rootUuid = uuid.v5(baseId, UUID_V5_NAMESPACE);
  await populateVocabulary(rootNode.list, vocabulary, rootUuid);
  const filename = `thesauri/${OUTPUT_FILENAME_PREFIX}-${baseId}.json`;
  fs.writeFileSync(filename, JSON.stringify(vocabulary, null, 2) + "\n");
  console.log(`Successfully completed building ${filename}`);
}

async function main() {
  for (const nodeId of rootNodeIds) {
    await buildTree(nodeId).catch((e) => console.log(e));
  }
}

main();
