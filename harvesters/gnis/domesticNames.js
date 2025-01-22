import dayjs from 'dayjs';

import { writeToLocalFile } from '../utils';
import {
  DomesticNamesConfig,
  GNIS_HARVESTERS_ENUM,
  gnisConfig
} from './gnisConfig';
import { parseCitationFromXml, parseTxtFileToJson } from './gnisUtils';

const { DOMESTIC_NAMES } = GNIS_HARVESTERS_ENUM;
const { CITATION_FILANAME, DST_FILENAME_PREFIX, TXT_FILENAME } =
  DomesticNamesConfig;
const { BASE_REPO_URL, KEYWORDS_DIR, THESAURUS_DIR } = gnisConfig;

function generateThesaurusConfig(statename, keywordsUrl, citation) {
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
      identifier: [
        {
          identifier: `gnis-domestic-names-${statename}`
        }
      ]
    },
    label: `GNIS - Domestic Names - ${statename} - Thesaurus`,
    keywordsUrl
  };
  return thesaurusConfig;
}

export async function harvestDomesticNames() {
  console.log('Harvesting Domestic Names');

  // Load the data from the file and parse it into JSON
  // The resulting JSON will have an array of objects with the following properties:
  //  "feature_id"
  //  "feature_name"
  //  "feature_class"
  //  "state_name"
  //  "state_numeric"
  //  "county_name"
  //  "county_numeric"
  //  "map_name"
  //  "date_created"
  //  "date_edited"
  // The JSON data also contains additional keys not listed above, which contain coordinates for the features
  const jsonData = await parseTxtFileToJson(
    `${DOMESTIC_NAMES}/${TXT_FILENAME}`
  );

  const hierarchy = [];
  const stateMap = {};

  jsonData.forEach(item => {
    const {
      state_name: state,
      state_numeric: stateNumeric,
      feature_class: featureClass,
      feature_name: featureName,
      feature_id: featureId
    } = item;

    if (!stateMap[state]) {
      let stateUuid = `${stateNumeric}-${state}`;
      stateUuid = stateUuid.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const stateNode = {
        uuid: stateUuid,
        label: state,
        definition: `${state} is a state in the United States.`,
        children: []
      };
      stateMap[state] = stateNode;
      hierarchy.push(stateNode);
    }

    const stateNode = stateMap[state];

    let featureClassNode = stateNode.children.find(
      child => child.label === featureClass
    );

    if (!featureClassNode) {
      let classUuid = `${state}-${featureClass}`;
      classUuid = classUuid.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      featureClassNode = {
        uuid: classUuid,
        label: featureClass,
        definition: `${featureClass} is a type of feature found in ${state}.`,
        children: []
      };
      stateNode.children.push(featureClassNode);
    }

    const featureExists = featureClassNode.children.some(
      child => child.label === featureName
    );

    if (!featureExists) {
      featureClassNode.children.push({
        uuid: featureId,
        label: featureName,
        definition: `${featureName} is a specific ${featureClass} in ${state}.`,
        children: []
      });
    }
  });

  const citation = await parseCitationFromXml(
    `${DOMESTIC_NAMES}/${CITATION_FILANAME}`
  );

  hierarchy.forEach(state => {
    let statename = state.label;
    if (statename === '') {
      statename = 'Unknown';
    }
    let filename = `${DST_FILENAME_PREFIX}${statename}`;
    filename = filename.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    filename = `${filename}.json`;
    writeToLocalFile([state], `${KEYWORDS_DIR}/${filename}`);
    const keywordsUrl = `${BASE_REPO_URL}/${KEYWORDS_DIR}/${filename}`;
    const thesaurusConfig = generateThesaurusConfig(
      state.label,
      keywordsUrl,
      citation
    );
    writeToLocalFile(thesaurusConfig, `${THESAURUS_DIR}/${filename}`);
  });
}
