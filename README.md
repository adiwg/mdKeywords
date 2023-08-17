# mdkeywords

This repository handles harvesting of keywords from ScienceBase, GCMD, and USGS.  
It is also used to host the files using a service called [JSDelivr](https://www.jsdelivr.com/).

## conf/

This directory contains the configuration files for the harvesters in the src/ directory.

## src/

This directory contains the source files for the harvesters to generate keyword files.

## resources/

This directory contains the json file for the list of vocabularies (vocabularies.json). It is automatically generated and contains the citation information for a vocabulary.

### resources/json/

This directory contains all the keywords files in the mdEditor's json format.

## Getting Started

This repository is not designed to be cloned and modified, the intent is for it to be used as provided by the maintainers.

If you are a developer and need to modify this repo, you can continue with the instructions below...

The harvesters can be run in different ways depending on the goal.
There is also a GitHub Action that could be used to automate nightly runs of the main control process.

The main control process handles choosing which harvester to use based on the source of the keywords.
Each harvester handles generating the configuration objects as well as the keywords files for a single source.
You can run this process for only a specified source or for all sources.

### Install and Run

This is an npm project, start by cloning and installing the normal way:

`npm install`

You can inspect package.json to find the following execution options:

`npm start` will run all the harvesters

`npm run sb` will limit harvesting to ScienceBase

`npm run gcmd` will limit harvesting to GCMD

`npm run usgs` will limit harvesting to USGS

Note that the actual format of that command is just this:

`node src/index.js source=sciencebase` where the source can be any of

- sciencebase
- gcmd
- usgs

#### gcmd-all

There is one more way to run the GCMD harvester, which will produce keyword files and configuration objects for all the known GCMD vocabularies.  
The list of GCMD vocabularies is stored in `conf/gcmd-vocabularies.json`  
The script for this is `src/gcmd-all.js` and uses the config file `conf/gcmd-all.json`

In order to run this script, simply execute it:

`node src/gcmd-all.js`

This will produce a second dynamic-manifest file `resources/gcmd-vocabularies-dynamic.json` with the GCMD vocabulary configuration objects as well as keyword files for each vocabulary.
