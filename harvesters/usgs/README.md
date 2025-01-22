# USGS Harvester

## Purpose

The **USGS Harvester** collects keywords and thesauri from the United States Geological Survey (USGS). These vocabularies provide standardized terminology for geographic, geological, and environmental data, enabling consistent metadata management for datasets. The harvester generates hierarchical JSON files that can be integrated into **mdEditor**, supporting metadata workflows in the **USGS NGGDPP** project.

## Vocabularies Processed

The USGS Harvester generates thesauri and keyword files for the following categories:

- Common geographic areas (e.g., continents, countries, states, and provinces)
- USGS Thesaurus (topics and methods of scientific study)
- Alexandria Digital Library Feature Type Thesaurus (types of named geographic features)
- Lithologic classification of geologic map units
- ISO 19115 Topic Category (general geospatial data topics)
- Data Categories for Marine Planning
- Thesaurus categories (attributes of thesauri, such as hierarchy)

These vocabularies are essential for maintaining structured and consistent metadata for scientific and geographic datasets.

## Input and Output

### Input

The USGS Harvester dynamically retrieves thesauri from the USGS API. No static input files are required, as all metadata is fetched during runtime.

### Output Directory

- **Path:** `resources/`
- **Description:** Directory where the generated JSON files are saved.
  - `resources/keywords/`: Contains JSON files for each keyword hierarchy.
  - `resources/thesaurus/`: Contains thesaurus configuration JSON files.

## How It Works

1. **Retrieve Thesauri**:
   - Fetches thesauri metadata from the USGS API.
2. **Process Metadata**:
   - Constructs hierarchical structures for each thesaurus.
3. **Generate JSON Files**:
   - Outputs JSON files to `resources/keywords/` and `resources/thesaurus/`.

## Running the USGS Harvester

To run the harvester, execute the following command from the root directory:

`yarn usgs`

**Important Notes:**

- Ensure all dependencies are installed by running `yarn install` before execution.
- The command must be run from the repository’s root directory.

## Validation and Testing

The USGS harvester generates files that are validated against schemas. Refer to the root README for detailed instructions on validation.
