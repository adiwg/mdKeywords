// These are named the same as their directories,
// so they can be used to dynamically load the config data
export const GNIS_HARVESTERS_ENUM = {
  ANTARCTICA: 'Antarctica',
  DOMESTIC_NAMES: 'DomesticNames',
  TOPICAL: 'Topical'
};

export const gnisConfig = {
  BASE_REPO_URL:
    'https://cdn.jsdelivr.net/gh/USGS-NGGDPP/mdEditor-keywords@main',
  DATA_DIR: 'harvesters/gnis/data',
  KEYWORDS_DIR: 'resources/keywords',
  THESAURUS_DIR: 'resources/thesaurus'
};

export const AntarcticaConfig = {
  CITATION_FILENAME: 'Gazetteer_Antarctica_Text.xml',
  DST_FILENAME: 'gnis-antarctica.json',
  TXT_FILENAME: 'AntarcticaNamesAntarctica.txt'
};

export const DomesticNamesConfig = {
  CITATION_FILANAME: 'DomesticNames_National_Text.xml',
  DST_FILENAME_PREFIX: 'gnis-domestic-',
  TXT_FILENAME: 'DomesticNames_National.txt'
};
