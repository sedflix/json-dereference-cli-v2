# JSON Dereference CLI

*Very* simple CLI tool that wraps the
excellent [json-schema-ref-parser](https://github.com/BigstickCarpet/json-schema-ref-parser) library.

[![Node.js Package](https://github.com/sedflix/json-dereference-cli-v2/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/sedflix/json-dereference-cli-v2/actions/workflows/npm-publish.yml)

## Usage

```bash
# Using npx:
npx json-dereference-cli -s <schema> [-i <spaces>] [-o <output>] [-t <type>]

# Installing globally:
npm install -g json-dereference-cli
json-dereference -s <schema>  [-i <spaces>] [-o <output>] [-t <type>]
```

*Note:* The input file can either be `json`, or `yaml` / `yml`.

*Note:* The output file types are either `json` or `yaml` / `yml`. This is determined from the file extension for the
output file path passed in or using `-t json|yaml` when writing to stdout.
