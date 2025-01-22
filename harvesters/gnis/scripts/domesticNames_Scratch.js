import { readdir } from 'fs/promises';

import { writeToLocalFile } from '../../utils';
import {
  DomesticNamesConfig,
  GNIS_HARVESTERS_ENUM,
  gnisConfig
} from '../gnisConfig';
import { parseTxtFileToJson } from '../gnisUtils';

const { DOMESTIC_NAMES } = GNIS_HARVESTERS_ENUM;
const { NATIONAL_FILENAME } = DomesticNamesConfig;
const { DATA_DIR } = gnisConfig;

export async function harvestDomesticNames() {
  console.log('Harvesting Domestic Names');
  const jsonData = await parseTxtFileToJson(
    `${DOMESTIC_NAMES}/${NATIONAL_FILENAME}`
  );
  const numberOfRecords = jsonData.length;
  const namesSet = new Set(jsonData.map(item => item.feature_name));
  const names = Array.from(namesSet);
  const numberOfNames = names.length;
  const statesSet = new Set(jsonData.map(item => item.state_name));
  const states = Array.from(statesSet);
  const featureClassSet = new Set(jsonData.map(item => item.feature_class));
  const featureClasses = Array.from(featureClassSet);
  const features = {};
  featureClasses.forEach(featureClass => {
    const count = jsonData.filter(
      item => item.feature_class === featureClass
    ).length;
    features[featureClass] = count;
  });
  const counties = {};
  const countyLength = {};
  states.forEach(state => {
    const stateCountiesSet = new Set(
      jsonData
        .filter(item => item.state_name === state)
        .map(item => item.county_name)
    );
    const stateCounties = Array.from(stateCountiesSet);
    counties[state] = stateCounties;
    countyLength[state] = stateCounties.length;
  });
  const numberOfRecordsByState = {};
  states.forEach(state => {
    const count = jsonData.filter(item => item.state_name === state).length;
    numberOfRecordsByState[state] = count;
  });
  const stateWithMostNumberOfRecords = Object.keys(
    numberOfRecordsByState
  ).reduce((a, b) =>
    numberOfRecordsByState[a] > numberOfRecordsByState[b] ? a : b
  );
  const stateNames = {};
  const numberOfNamesByState = {};
  states.forEach(state => {
    const namesSet = new Set(
      jsonData
        .filter(item => item.state_name === state)
        .map(item => item.feature_name)
    );
    const names = Array.from(namesSet);
    stateNames[state] = names;
    numberOfNamesByState[state] = names.length;
  });
  const featureWithMostNumberOfRecords = Object.keys(features).reduce((a, b) =>
    features[a] > features[b] ? a : b
  );
  const tmpObj = {
    numberOfRecords,
    numberOfNames,
    numberOfStates: states.length,
    numberOfFeatures: featureClasses.length,
    numberOfCounties: Object.values(countyLength).reduce(
      (total, count) => total + count,
      0
    ),
    headers: Object.keys(jsonData[0]),
    states,
    numberOfRecordsByState,
    stateWithMostNumberOfRecords,
    mostNumberOfRecordsInAState:
      numberOfRecordsByState[stateWithMostNumberOfRecords],
    numberOfNamesByState,
    counties,
    countyLength,
    featureClasses,
    features,
    featureWithMostNumberOfRecords,
    mostNumberOfRecordsInAFeature: features[featureWithMostNumberOfRecords]
  };

  writeToLocalFile(tmpObj, 'tmp/national.json');

  const stateFilenames = await readdir(`${DATA_DIR}/${DOMESTIC_NAMES}/States`);

  for (const filename of stateFilenames) {
    const jsonData = await parseTxtFileToJson(
      `${DOMESTIC_NAMES}/States/${filename}`
    );

    const numberOfRecords = jsonData.length;
    const namesSet = new Set(jsonData.map(item => item.feature_name));
    const names = Array.from(namesSet);
    const numberOfNames = names.length;
    const statesSet = new Set(jsonData.map(item => item.state_name));
    const states = Array.from(statesSet);
    const numberOfStates = states.length;
    const featureClassSet = new Set(jsonData.map(item => item.feature_class));
    const featureClasses = Array.from(featureClassSet);

    const features = {};
    featureClasses.forEach(featureClass => {
      const count = jsonData.filter(
        item => item.feature_class === featureClass
      ).length;
      features[featureClass] = count;
    });

    const counties = {};
    const countyLength = {};
    states.forEach(state => {
      const stateCountiesSet = new Set(
        jsonData
          .filter(item => item.state_name === state)
          .map(item => item.county_name)
      );
      const stateCounties = Array.from(stateCountiesSet);
      counties[state] = stateCounties;
      countyLength[state] = stateCounties.length;
    });

    const numberOfRecordsByState = {};
    states.forEach(state => {
      const count = jsonData.filter(item => item.state_name === state).length;
      numberOfRecordsByState[state] = count;
    });

    const stateWithMostNumberOfRecords = Object.keys(
      numberOfRecordsByState
    ).reduce((a, b) =>
      numberOfRecordsByState[a] > numberOfRecordsByState[b] ? a : b
    );

    const featureWithMostNumberOfRecords = Object.keys(features).reduce(
      (a, b) => (features[a] > features[b] ? a : b)
    );

    const tmpObj = {
      numberOfRecords,
      numberOfNames,
      numberOfStates,
      numberOfFeatures: featureClasses.length,
      numberOfCounties: Object.values(countyLength).reduce(
        (total, count) => total + count,
        0
      ),
      headers: Object.keys(jsonData[0]),
      states,
      numberOfRecordsByState,
      stateWithMostNumberOfRecords,
      mostNumberOfRecordsInAState:
        numberOfRecordsByState[stateWithMostNumberOfRecords],
      counties,
      countyLength,
      featureClasses,
      features,
      featureWithMostNumberOfRecords,
      mostNumberOfRecordsInAFeature: features[featureWithMostNumberOfRecords]
    };

    writeToLocalFile(tmpObj, `tmp/${filename.replace('.txt', '.json')}`);
  }
}
