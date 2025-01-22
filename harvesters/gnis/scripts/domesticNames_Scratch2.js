import { writeToLocalFile } from '../../utils';
import { DomesticNamesConfig, GNIS_HARVESTERS_ENUM } from '../gnisConfig';
import { parseTxtFileToJson } from '../gnisUtils';

const { DOMESTIC_NAMES } = GNIS_HARVESTERS_ENUM;
const { NATIONAL_FILENAME } = DomesticNamesConfig;

export async function harvestDomesticNames() {
  console.log('Harvesting Domestic Names');
  const jsonData = await parseTxtFileToJson(
    `${DOMESTIC_NAMES}/${NATIONAL_FILENAME}`
  );

  const statesSet = new Set(jsonData.map(item => item.state_name));
  const states = Array.from(statesSet);

  const namesByState = {};

  const stateFeatureMap = {};
  jsonData.forEach(item => {
    if (!stateFeatureMap[item.state_name]) {
      stateFeatureMap[item.state_name] = {};
    }
    if (!stateFeatureMap[item.state_name][item.feature_name]) {
      stateFeatureMap[item.state_name][item.feature_name] = {
        feature_name: item.feature_name,
        state_names: new Set(),
        feature_ids: [],
        feature_class: item.feature_class,
        county_names: new Set()
      };
    }
    const feature = stateFeatureMap[item.state_name][item.feature_name];
    feature.state_names.add(item.state_name);
    feature.feature_ids.push(item.feature_id);
    feature.county_names.add(item.county_name);
  });

  Object.keys(stateFeatureMap).forEach(state => {
    namesByState[state] = Object.values(stateFeatureMap[state]).map(feature => {
      return {
        feature_name: feature.feature_name,
        feature_class: feature.feature_class,
        number_of_ids: feature.feature_ids.length,
        number_of_counties: feature.county_names.size,
        state_names: Array.from(feature.state_names),
        feature_ids: feature.feature_ids,
        county_names: Array.from(feature.county_names)
      };
    });
  });

  const numberOfRecordsByState = {};
  states.forEach(state => {
    const count = namesByState[state].length;
    numberOfRecordsByState[state] = count;
  });

  // sort numberOfRecordsByState by state name
  const sortedNumberOfRecordsByState = {};
  Object.keys(numberOfRecordsByState)
    .sort()
    .forEach(key => {
      sortedNumberOfRecordsByState[key] = numberOfRecordsByState[key];
    });

  writeToLocalFile(
    sortedNumberOfRecordsByState,
    'tmp/numberOfRecordsByState.json'
  );

  states.forEach(state => {
    let filename = state;
    if (filename === '') {
      filename = 'Unknown';
    }
    writeToLocalFile(
      namesByState[state].sort((a, b) =>
        a.feature_name.localeCompare(b.feature_name)
      ),
      `tmp/states/${filename}.json`
    );
  });
}
