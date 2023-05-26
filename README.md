# mdkeywords

## harvesters/

This directory contains the configurations and source files for the harvesters to generate keyword files.

## resources/

This directory contains the json file for the list of vocabularies (vocabularies.json). It is automatically generated and contains the citation information for a vocabulary.

### resources/json/

This directory contains all the keywords files in the mdEditor's json format.

## Getting Started

Generally speaking, this repository is expected to run inside a GitHub actions workflow, however, for development purposes, you can run this locally.

### Install and Run

Your working directory needs to be harvesters/ then run 'npm install' and 'npm start'

The harvesters are driven from the profiles in the mdProfiles repository. The main process starts by compiling a list of unique vocabularies across all the profiles,
then will process them in turn, generating a single keywords file for each vocabulary.

# TO BE DEPRECATED...

## The following will be deprecated but should be saved until official

[![NPM version](https://badge.fury.io/js/mdkeywords.svg)](https://npmjs.org/package/mdkeywords)
[![Build Status](https://travis-ci.org/adiwg/mdKeywords.svg?branch=master)](https://travis-ci.org/adiwg/mdKeywords)

> Keywords for metadata

## Installation

```sh
$ npm install --save mdkeywords
```

## Usage

```javascript
var mdkeywords = require("mdkeywords");
mdkeywords.category;
mdkeywords.asArray();
```

## License

Unlicense © [jbradley@arcticlcc.org](https://github.com/jlblcc)
