# mdkeywords

This repository handles harvesting of keywords from ScienceBase, GCMD, and USGS.  
It is also used to host the files using a service called [JSDelivr](https://www.jsdelivr.com/).

## conf/

This directory contains the main configuration file and lists of vocabularies for ScienceBase and GCMD.

## src/

This directory contains the source files for the harvesters. 

## resources/

This directory contains the manifest file for the list of vocabularies (manifest.json). It is automatically generated and contains the details about the vocabulary and where to access its configuration file. The configuration file will then point to the keywords file. The format of a thesaurus entry in the manifest file is as follows:

```
{
  "name": "",
  "url": ""
}
```

The name is optional and is for human readability of the thesaurus, it is not used by the mdEditor.

### resources/thesaurus/

This directory contains all the thesaurus configuration files. The format for a thesaurus configuation is as follows:

```
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
  "keywords": null,
  "keywordsUrl": ""
}
```

Note that the keywords key is set to null. If a keywordsUrl is provided then keywords should be null, but you can optionally provide the keywords array directly inside of this configuration file if desired - that is not recommended. The keywordsUrl should use the jsdelivr url to point to the keywords file in the resources/keywords/ directory that is associated with the specified thesaurus. There is a resources/schema/ directory with a detailed specification for the configuration file format.

### resources/keywords/

This directory contains all the keywords files. Depending on the source, the keywords file format is slightly different (this should probably be normalized).

GCMD keyword files are formatted as follows (contains nested children)

```
[
  {
    "uuid": "",
    "label": "",
    "broader": ,
    "definition": "",
    "children": [
      {
        "uuid": "",
        "label": "",
        "broader": "",
        "definition": "",
        "children": [ ]
      }
    ]
  }
]
```

ScienceBase keyword files are formatted as follows (children array is always empty)

```
[
  {
    "uuid": "",
    "parentId": "",
    "label": "",
    "definition": "",
    "children": []
  }
]
```

USGS Thesaurus is formatted as follows (contains nested children)

```
[
  {
    "uuid": "",
    "label": "",
    "definition": "",
    "children": [
      {
        "uuid": "",
        "label": "",
        "definition": "",
        "children": [ ]
      }
    ]
  }
]
```

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

`npm start` OR `npm run build` will run all the harvesters (both commands are aliases for `node src/main.js`)
