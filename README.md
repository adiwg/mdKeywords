# mdkeywords

This repository handles harvesting of keywords from ScienceBase, GCMD, and USGS.  
It is also used to host the files using a service called [JSDelivr](https://www.jsdelivr.com/).

## conf/

This directory contains the main configuration file and lists of vocabularies for ScienceBase and GCMD.

## src/

This directory contains the source files for the harvesters to generate the manifest file and citation and keywords files.

## resources/

This directory contains the manifest file for the list of vocabularies (manifest.json). It is automatically generated and contains the details about the vocabulary and where to access its citation and keywords files.

### resources/citations/

This directory contains all the citation files for the individual vocabularies.

### resources/keywords/

This directory contains all the keywords files in the mdEditor's json format.

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

`npm start` OR `npm run build` will run all the harvesters
