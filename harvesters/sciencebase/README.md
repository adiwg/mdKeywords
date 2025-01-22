# ScienceBase Harvester

## Purpose

The **ScienceBase Harvester** collects keywords and thesauri from the ScienceBase system. These vocabularies are essential for managing metadata related to conservation, collection management, and scientific data cataloging. The harvester generates hierarchical JSON files that can be integrated into **mdEditor**, supporting metadata workflows in the **USGS NGGDPP** project.

## Vocabularies Processed

The ScienceBase Harvester generates thesauri and keyword files for the following categories:

- Favret Conservation Status (dry)
- Favret Conservation Status (fluid)
- Favret Conservation Status (slide)
- Favret Container Condition (dry)
- Favret Container Condition (fluid)
- Favret Container Condition (slide)
- Favret Processing State (dry)
- Favret Processing State (fluid)
- Favret Processing State (slide)
- CollectionTheme
- primaryPurpose
- userGroup
- category
- unit
- type
- Known To Contain Types
- Hazardous Materials
- NGGDPP ReSciColl ScienceBase Type Tags

These vocabularies are treated as individual thesauri, enabling precise metadata management for various collection and conservation contexts.

## Input and Output

### Input File

- **Path:** `harvesters/sciencebase/vocabularies.json`
- **Description:** JSON file containing a list of vocabulary IDs and names to process.

### Output Directory

- **Path:** `resources/`
- **Description:** Directory where the generated JSON files are saved.
  - `resources/keywords/`: Contains JSON files for each keyword hierarchy.
  - `resources/thesaurus/`: Contains thesaurus configuration JSON files.

## How It Works

1. **Load Input Data**:
   - Reads vocabulary IDs from `vocabularies.json`.
2. **Fetch Metadata**:
   - Retrieves hierarchical structure and definitions from the ScienceBase API.
3. **Generate JSON Files**:
   - Outputs keyword and thesaurus JSON files to `resources/keywords/` and `resources/thesaurus/`.

## Running the ScienceBase Harvester

To run the harvester, execute the following command from the root directory:

`yarn sciencebase`

**Important Notes:**

- Ensure all dependencies are installed by running `yarn install` before execution.
- The command must be run from the repository’s root directory.

## Validation and Testing

The ScienceBase harvester generates files that are validated against schemas. Refer to the root README for detailed instructions on validation.
