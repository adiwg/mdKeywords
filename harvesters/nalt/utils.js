import dayjs from 'dayjs';
import fs from 'fs/promises';
import { Parser, processors } from 'xml2js';

const createParser = () => {
  const parser = new Parser({
    explicitArray: false, // Do not put single elements in arrays
    mergeAttrs: true, // Merge attributes with child elements
    tagNameProcessors: [processors.stripPrefix] // Remove namespace prefixes
  });

  return parser;
};

const readXmlFile = async filePath => {
  console.log(`Reading XML file from ${filePath}`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return data;
  } catch (error) {
    console.error(`Error reading XML file: ${error.message}`);
    throw error;
  }
};

const parseXmlData = async xmlData => {
  console.log('Parsing XML data');
  try {
    const parser = createParser();
    const parsedData = await parser.parseStringPromise(xmlData);
    return parsedData;
  } catch (error) {
    console.error(`Error parsing XML data: ${error.message}`);
    throw error;
  }
};

const processEntries = parsedData => {
  console.log('Processing entries');
  const descriptions = parsedData.RDF?.Description;
  const primaryEntries = new Map();
  const defEntries = new Map();
  const rootNodes = [];
  descriptions.forEach(description => {
    const about = description['rdf:about'];
    const id = about.split('/').pop().replace('_def', '');
    const entries = about.endsWith('_def') ? defEntries : primaryEntries;
    entries.set(id, description);
    if (description.topConceptOf) {
      rootNodes.push(description);
    }
  });
  return { primaryEntries, defEntries, rootNodes };
};

const buildHierarchies = ({ primaryEntries, defEntries, rootNodes }) =>
  rootNodes.map(root => createNode(root, primaryEntries, defEntries));

const extractId = entry => entry['rdf:about'].split('/').pop();

const createNode = (entry, primaryEntries, defEntries) => ({
  uuid: extractId(entry),
  label: getLabel(entry),
  definition: getDefinition(entry, defEntries),
  children: getChildren(entry, primaryEntries, defEntries)
});

const extractEnglishValue = values => {
  const valueObj = Array.isArray(values)
    ? values.find(val => val['xml:lang'] === 'en')
    : values['xml:lang'] === 'en'
      ? values
      : null;
  return valueObj ? valueObj._ : null;
};

const getLabel = ({ prefLabel, altLabel }) => {
  let label = null;
  if (prefLabel) {
    label = extractEnglishValue(prefLabel);
  }
  if (!label && altLabel) {
    label = 'alt - ' + extractEnglishValue(altLabel);
  }
  return label;
};

const getDefinition = (entry, defEntries) => {
  const { definition } = entry;
  if (definition?.['rdf:resource']) {
    const defId = definition['rdf:resource'].split('/').pop().split('_')[0];
    const defEntry = defEntries.get(defId);
    if (defEntry?.value?.length > 0) {
      return extractEnglishValue(defEntry.value);
    }
  }
  return '';
};

const getChildren = (entry, entryMap, defEntries) => {
  const children = [];
  const { narrower } = entry;
  if (narrower?.length > 0) {
    narrower.forEach(childRef => {
      const childId = childRef['rdf:resource'].split('/').pop();
      const childEntry = entryMap.get(childId);
      if (childEntry) {
        children.push(createNode(childEntry, entryMap, defEntries));
      }
    });
  }
  return children;
};

const generateThesaurusConfig = (uuid, label, node, keywordsUrl) => {
  const thesaurusConfig = {
    citation: {
      date: [
        {
          date: dayjs(node.modified._).format('YYYY-MM-DDTHH:mm:ssZ'),
          dateType: 'revision'
        }
      ],
      description: label,
      title: label,
      edition: '',
      onlineResource: [{ uri: node['rdf:about'] }],
      identifier: [
        {
          identifier: uuid
        }
      ]
    },
    label,
    keywordsUrl
  };
  return thesaurusConfig;
};

const saveHierarchies = async (
  hierarchies,
  outputFilePath,
  { primaryEntries }
) => {
  for (const tree of hierarchies) {
    const { uuid, label } = tree;
    const node = primaryEntries.get(uuid);
    console.log(`Saving tree ${uuid} ${label}`);
    const filename = `nalt-${uuid}.json`;
    const treeFilePath = `${outputFilePath}/keywords/${filename}`;
    const configFile = `${outputFilePath}/thesaurus/${filename}`;
    const keywordsUrl = `https://cdn.jsdelivr.net/gh/USGS-NGGDPP/mdEditor-keywords@main/resources/keywords/${filename}`;
    const treeConfig = generateThesaurusConfig(uuid, label, node, keywordsUrl);
    await saveJsonFile(treeFilePath, [tree]);
    console.log('Keywords saved, saving thesaurus config...');
    await saveJsonFile(configFile, treeConfig);
    console.log('Thesaurus config saved');
  }
};

const saveJsonFile = async (filePath, data) => {
  console.log(`Saving JSON file to ${filePath}`);
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf-8');
    console.log(`File successfully saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving JSON file: ${error.message}`);
    throw error;
  }
};

export {
  buildHierarchies,
  generateThesaurusConfig,
  parseXmlData,
  processEntries,
  readXmlFile,
  saveHierarchies
};
