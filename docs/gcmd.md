# GCMD Harvester

The GCMD harvester has several files associated with it and can be run in multiple ways depending on the goal.

## Files

### Configuration Files (conf/)

* conf/gcmd-all.json
* conf/gcmd-vocabularies.json
* conf/gcmd.json

### Source Files (src/)

* src/gcmd-all.js
* src/gcmd.js

### Output Files

* gcmd-vocabularies-dynamic.json
* {keyword files}

## How to use the GCMD Harvester

The harvesters are not intended to be run without the use of the control process, but in the case of GCMD there is a secondary control process `gcmd-all.js` which is designed to generate thesaurus configuration and keyword files for all the GCMD vocabularies. The specific vocabularies that will be processed are stored in the configuration file `gcmd-vocabularies.json`.

### Getting Started

Regardless of how this harvester is run it still needs the usual setup with npm

#### Install

From the `harvesters/` directory, execute:  
`npm install`

#### Run

This is where you have a few choices. The GCMD harvester can be run alongside the other harvesters with the main control process (`index.js`). It can be run independently but still using the main control process. Or it can be run using the custom control process (`gcmd-all.js`).

##### Run All

`npm start`

##### Run GCMD only

`npm run gcmd`

##### Run GCMD All

`node src/gcmd-all.js`

### Configuration

There are 3 configuration files, but not all are used at the same time. When running the **main control process** the only config file used is `gcmd.json`. When running the **custom control process** both `gcmd-all.json` and `gcmd-vocabularies.json` are used.

#### gcmd.json

* baseUrl - this is the base URL for the GCMD API, should be `https://gcmd.earthdata.nasa.gov/kms`
* outputFileBaseUrl - this is the base URL used to point to the `resources/json/` directory within this repository and is used in the generation of the keywordsUrl in the thesaurus configuration, since this is currently using JSDelivr it should be `https://cdn.jsdelivr.net/gh/adiwg/mdKeywords@master/resources/json/`
* outputFilePrefix - this is the prefix for the keywords files so that all keywords files start with the same prefix, they are then identified by the id of the vocabulary, currently `gcmd-`

#### gcmd-all.json

* outputFilePath - this is the path to where the GCMD specific vocabularies-dyanic.json file will be placed, which will be named according to vocabulariesFilename, should be `resources`
* vocabulariesFilename - this is the filename for the list of vocabularies to be processed, should be `gcmd-vocabularies.json`
* vocabulariesOutputFilename - this is the name used for the GCMD specific vocabularies-dyanic.json file, should be `gcmd-vocabularies-dynamic.json`

#### gcmd-vocabularies.json

This is the list of vocabularies to be processed when running the custom GCMD control process.

The format of this file looks like

```
{
  "vocabularies": [
    {
      "id": "<gcmd vocabulary uuid>"
    }
  ]
}
```

#### gcmd-vocabularies-dynamic.json

This is the thesaurus configuration file produced by the custom GCMD control process, which has the same format as `vocabularies-dynamic.json` produced by the main control process.

```
[
  {
    "citation": {
      "date": [
        {
          "date": "",
          "dateType": ""
        }
      ],
      "description": "",
      "title": "",
      "edition": "",
      "onlineResource": [
        {
          "uri": ""
        }
      ],
      "identifier": [
        {
          "identifier": ""
        }
      ]
    },
    "keywordType": "",
    "label": "",
    "dynamicLoad": true,
    "keywordsUrl": "",
    "keywords": []
  }
]
```
