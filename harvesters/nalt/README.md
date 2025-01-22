# NALT Harvester

## Purpose

The **NALT Harvester** processes RDF/XML from the National Agricultural Library Thesaurus (NALT) to generate structured JSON files. These files provide hierarchical keyword structures and thesaurus configurations designed for integration with **mdEditor**, supporting metadata workflows in the **USGS NGGDPP** project.

## Vocabularies Processed

The NALT Harvester generates thesauri and keyword files for the following categories:

- Taxonomic hierarchy
- Fields of study
- Animals, livestock, One Health
- Economics, trade, law, business, industry
- Farms, agricultural production systems
- Human nutrition, food safety, and quality
- Forestry, wildland management
- Geographical locations
- Natural resources, conservation, environment
- Plant production, gardening
- Research, technology, methods
- Rural development, communities, education, extension

## Input and Output

### Input File

- **Path:** `harvesters/nalt/data/nalt-full.rdf`
- **Description:** RDF/XML file containing NALT metadata.

### Output Directory

- **Path:** `resources/`
- **Description:** Directory where the generated JSON files are saved.
  - `resources/keywords/`: Contains JSON files for each keyword hierarchy.
  - `resources/thesaurus/`: Contains thesaurus configuration JSON files.

## How It Works

1. **Load the Input File**:
   - The harvester reads the RDF/XML file from `harvesters/nalt/data/nalt-full.rdf`.
2. **Parse Metadata**:
   - Extracts entries and relationships from the RDF structure.
3. **Build Hierarchies**:
   - Creates a hierarchical structure of keywords based on "narrower" relationships.
4. **Generate JSON Files**:
   - Outputs JSON files to `resources/keywords/` and `resources/thesaurus/`.

## Running the NALT Harvester

To run the harvester, execute the following command from the root directory:

`yarn nalt`

**Important Notes:**

- Ensure all dependencies are installed by running `yarn install` before execution.
- The command must be run from the repository’s root directory.

## Validation and Testing

The NALT harvester generates files that are validated against schemas. Refer to the root README for detailed instructions on validation.
