# thesaurus harvesters

Collection of scripts used to build various thesauri

## How to use these harvesters

All code is in the `harvesters/src/` directory, each harvester is contained within its own directory.

Each harvester requires a json config file specified by the `CONF_JSON` environment variable.

Example building USGS locally:

- create an environment file located at `harvesters/src/usgs/.env`
- create a config file located at `harvesters/src/usgs/conf.json`  
  The value of `CONF_JSON` in `.env` should be `src/usgs/conf.json`

## How to run the scrips

**When installing dependencies or running the build scripts, the working directory must be `harvesters/`**

#### Install dependencies

`npm i`

#### USGS Thesaurus

`npm run build:usgs` OR `node src/usgs/index.js`

Example config:

```
{
  "SQL_SOURCE": "https://apps.usgs.gov/thesaurus/download/update-usgs-thesaurus.sql",
  "OUTPUT_FILENAME": "usgs.json"
}
```

#### NGGDPP Thesaurus

_Root id for NGGDPP: `4f4e475ee4b07f02db47df09`_

`npm run build:nggdpp` OR `node src/nggdpp/index.js`

Example config:

```
{
  "BASE_URL": "https://www.sciencebase.gov/vocab/categories",
  "OUTPUT_FILENAME_PREFIX": "nggdpp-",
  "ROOT_NODES": ["4f4e475ee4b07f02db47df09"]
}
```

_ROOT_NODES is an array of node ids, each id provided will generate a file specific to that node._

#### GCMD Thesaurus

`npm run build:gcmd` OR `node src/gcmd/index.js`

Example config:

```
{
  "CATEGORY_URL": "https://gcmd.earthdata.nasa.gov/kms/concepts/concept_scheme/",
  "OUTPUT_FILENAME_PREFIX": "gcmd-",
  "CATEGORIES": []
}
```
