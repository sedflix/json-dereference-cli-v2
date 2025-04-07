# JSON Dereference CLI v2

*Very* simple CLI tool that wraps the
excellent [json-schema-ref-parser](https://github.com/BigstickCarpet/json-schema-ref-parser) library.

[![Node.js Package](https://github.com/sedflix/json-dereference-cli-v2/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/sedflix/json-dereference-cli-v2/actions/workflows/npm-publish.yml)

## Usage

```bash
# Using npx:
npx json-dereference-cli-v2 -s <schema> [-i <spaces>] [-o <output>] [-t <type>]

# Installing globally:
npm install -g json-dereference-cli-v2
json-dereference-v2 -s <schema> [-i <spaces>] [-o <output>] [-t <type>]
```

### Options
- `-s <schema>`: Path to the input schema file (required).
- `-i <spaces>`: Number of spaces for indentation in the output (default: 2).
- `-o <output>`: Path to the output file (optional).
- `-t <type>`: Output type (`json` or `yaml`). If not specified, it is inferred from the output file extension.

### Examples

#### Dereference a JSON schema and output to a file:
```bash
json-dereference-v2 -s testdata/correct.schema.json -o testdata/output.json
```

#### Dereference a JSON schema and print to stdout in YAML format:
```bash
json-dereference-v2 -s testdata/correct.schema.json -t yaml
```

*Note:* The input file can either be `json`, or `yaml` / `yml`.

*Note:* The output file types are either `json` or `yaml` / `yml`. This is determined from the file extension for the
output file path passed in or using `-t json|yaml` when writing to stdout.

### Meta-Validation

The CLI now supports validating JSON Schemas against their meta-schema to ensure correctness and adherence to best practices. This is automatically performed during dereferencing.

#### Example:
```bash
json-dereference-v2 -s testdata/correct.schema.json
```
If the schema is invalid, an error message will be displayed.
