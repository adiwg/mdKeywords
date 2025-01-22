# GCMD Harvester

## Purpose

The **GCMD Harvester** gathers keywords and thesauri from the Global Change Master Directory (GCMD). These resources provide standardized terminology for Earth science data, climate research, and environmental monitoring. The harvester generates hierarchical JSON files that can be integrated into **mdEditor**, supporting metadata workflows in the **USGS NGGDPP** project.

## Vocabularies Processed

The GCMD Harvester generates thesauri and keyword files for the following categories:

- Chronostratigraphic Units
- Platforms
- Disciplines
- IDN Nodes
- ISO Topic Categories
- Horizontal Resolution Ranges
- Vertical Resolution Ranges
- Temporal Resolution Ranges
- Instruments
- Projects
- Persistent Identifier
- Private
- Phone Type
- Product Flag
- Dataset Progress
- Dataset Language
- Metadata Association Type
- Organization Personnel Role
- Personnel Role
- Organization Type
- Duration Unit
- Platform Type
- Collection Data Type
- Coordinate System
- Granule Spatial Representation
- Product Level Id
- Spatial Coverage Type
- Multimedia Format
- Metadata Language
- Contact Type
- Mime Type
- Distribution Size Unit
- Related URL Content Types
- Data Format
- Measurement Name
- Projection Name
- Projection Authority
- Chained Operations
- Operations
- Projection Datum Names
- Science Keywords

## Input and Output

### Input File

- **Path:** `harvesters/gcmd/vocabularies.json`
- **Description:** JSON file containing a list of GCMD vocabulary IDs and names to process.

### Output Directory

- **Path:** `resources/`
- **Description:** Directory where the generated JSON files are saved.
  - `resources/keywords/`: Contains JSON files for each keyword hierarchy.
  - `resources/thesaurus/`: Contains thesaurus configuration JSON files.

## How It Works

1. **Load Vocabulary Data**:
   - Reads vocabulary data from `harvesters/gcmd/vocabularies.json`.
2. **Fetch Metadata**:
   - Retrieves concept and keyword data for each vocabulary using the GCMD API.
3. **Build Hierarchies**:
   - Constructs hierarchical keyword structures based on broader and narrower relationships.
4. **Generate JSON Files**:
   - Outputs JSON files to `resources/keywords/` and `resources/thesaurus/`.

## Running the GCMD Harvester

To run the harvester, execute the following command from the root directory:

`yarn gcmd`

**Important Notes:**

- Ensure all dependencies are installed by running `yarn install` before execution.
- The command must be run from the repository’s root directory.

## Validation and Testing

The GCMD harvester generates files that are validated against schemas. Refer to the root README for detailed instructions on validation.
