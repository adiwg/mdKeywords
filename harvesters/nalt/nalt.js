import {
  buildHierarchies,
  parseXmlData,
  processEntries,
  readXmlFile,
  saveHierarchies
} from './utils';

const INPUT_FILE_PATH = 'harvesters/nalt/data/nalt-full.rdf';
const OUTPUT_FILE_PATH = 'resources/';

export default async function main() {
  console.log('Starting NALT Harvester...');
  try {
    const xmlData = await readXmlFile(INPUT_FILE_PATH);
    const parsedData = await parseXmlData(xmlData);
    const processedData = processEntries(parsedData);
    const hierarchies = buildHierarchies(processedData);
    await saveHierarchies(hierarchies, OUTPUT_FILE_PATH, processedData);
    console.log('Harvesting Complete');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}
