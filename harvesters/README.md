# USGS-NGGDPP mdEditor-keywords Harvesters

## Overview

This directory contains harvesters designed to automate the collection of keyword data from authoritative sources. Each harvester extracts keywords from a specific data source or system and processes them into two types of files:

1. **Keyword files** – Saved in `resources/keywords/`.
2. **Thesaurus files** – Saved in `resources/thesaurus/`.

These harvesters ensure that keyword data remains current, structured, and formatted for integration into **mdEditor**, improving the consistency and accuracy of metadata.

## Available Harvesters

### GNIS (Geographic Names Information System)

The GNIS Harvester collects geographic names and feature data for the United States and its territories. Harvested data includes names for natural and cultural features, administrative boundaries, and other spatial data.

### NALT (National Agricultural Library Thesaurus)

The NALT Harvester gathers keywords related to agricultural sciences, economics, human nutrition, and more, aiding metadata management for agricultural datasets.

### ScienceBase

The ScienceBase Harvester collects keywords for conservation, collection management, and scientific data cataloging, ensuring consistency in metadata for collections and specimens.

### USGS (United States Geological Survey)

The USGS Harvester retrieves thesauri related to geographic, geologic, and environmental data, standardizing metadata terms for scientific datasets.

## Configuration

Each harvester has specific configuration requirements detailed in its individual README. General prerequisites include:

- **Node.js**: Required to run the harvesters.
- **API Access**: Ensure access to APIs for the relevant harvesters (e.g., GNIS, ScienceBase).
- **Output Directories**: Set up `resources/keywords/` and `resources/thesaurus/`.

## Usage

Harvesters are executed from the root directory using commands specified in their respective README files. Refer to the root README for further instructions.
