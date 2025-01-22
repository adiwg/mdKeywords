import dayjs from 'dayjs';
import { writeToLocalFile } from '../utils';
import {
  AntarcticaConfig,
  GNIS_HARVESTERS_ENUM,
  gnisConfig
} from './gnisConfig';
import { parseCitationFromXml, parseTxtFileToJson } from './gnisUtils';

const { ANTARCTICA } = GNIS_HARVESTERS_ENUM;
const { CITATION_FILENAME, DST_FILENAME, TXT_FILENAME } = AntarcticaConfig;
const { BASE_REPO_URL, KEYWORDS_DIR, THESAURUS_DIR } = gnisConfig;

function extractClasses(jsonData) {
  const classes = [];
  jsonData.forEach(record => {
    const { feature_class } = record;
    if (!classes.includes(feature_class)) {
      classes.push(feature_class);
    }
  });
  return classes;
}

function generateClasses(classList, jsonData) {
  const classes = classList.map(className => ({
    uuid: `gnis-antarctica-${className}`,
    label: className,
    definition: `A class of geographic features in Antarctica with the class name ${className}`,
    children: generateKeywords(className, jsonData)
  }));
  return classes;
}

function generateKeywords(className, jsonData) {
  const keywords = jsonData
    .filter(record => record.feature_class === className)
    .map(record => ({
      uuid: record.feature_id,
      label: record.feature_name,
      definition: record.description,
      children: []
    }));
  return keywords;
}

function generateThesaurusConfig(keywordsUrl, citation) {
  const { pubdate, title } =
    citation.metadata.idinfo[0].citation[0].citeinfo[0];
  const { abstract } = citation.metadata.idinfo[0].descript[0];
  const { browsen } = citation.metadata.idinfo[0].browse[0];
  const thesaurusConfig = {
    citation: {
      date: [
        {
          date: dayjs(pubdate[0]).format('YYYY-MM-DDTHH:mm:ssZ'),
          dateType: 'revision'
        }
      ],
      description: abstract[0],
      title: title[0],
      edition: '',
      onlineResource: [{ uri: browsen[0] }],
      identifier: [{ identifier: 'gnis-antarctic-thesaurus' }]
    },
    label: 'GNIS Antarctica Thesaurus',
    keywordsUrl
  };
  return thesaurusConfig;
}

export async function harvestAntarctica() {
  console.log('Harvesting Antarctica');
  const jsonData = await parseTxtFileToJson(`${ANTARCTICA}/${TXT_FILENAME}`);
  const classList = extractClasses(jsonData);
  const keywords = [
    {
      uuid: 'gnis-antarctica',
      label: 'Antarctica',
      definition:
        "Antarctica is Earth's southernmost continent. It contains the geographic South Pole and is situated in the Antarctic region of the Southern Hemisphere, almost entirely south of the Antarctic Circle, and is surrounded by the Southern Ocean.",
      children: generateClasses(classList, jsonData)
    }
  ];
  writeToLocalFile(keywords, `${KEYWORDS_DIR}/${DST_FILENAME}`);
  const keywordsUrl = `${BASE_REPO_URL}/${KEYWORDS_DIR}/${DST_FILENAME}`;
  const citation = await parseCitationFromXml(
    `${ANTARCTICA}/${CITATION_FILENAME}`
  );
  const thesaurusConfig = generateThesaurusConfig(keywordsUrl, citation);
  writeToLocalFile(thesaurusConfig, `${THESAURUS_DIR}/${DST_FILENAME}`);
  console.log('Antarctica keywords harvested');
}
