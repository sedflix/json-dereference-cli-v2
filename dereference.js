#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const $RefParser = require('@apidevtools/json-schema-ref-parser');
const argv = require('minimist')(process.argv.slice(2));
const yaml = require('js-yaml');
const Ajv = require('ajv');
const Ajv2020 = require('ajv/dist/2020');

// Add a new CLI option `--no-validate` to disable schema validation
const disableValidation = argv['no-validate'] || false;

/**
 * Validates CLI arguments and returns parsed options.
 * @returns {Object} Parsed CLI options.
 */
function validateArguments() {
    if (!argv.s) {
        console.error('Usage: ' + process.argv[1] + ' -s <schema> [-i <spaces>] [-o <output>] [-t <type>] [--no-validate]');
        process.exit(1);
    }

    return {
        input: path.resolve(argv.s),
        output: argv.o ? path.resolve(argv.o) : undefined,
        indent: argv.i !== undefined ? argv.i : 2,
        type: argv.t
    };
}

/**
 * Detects the output format based on CLI arguments or file extension.
 * @param {string} output - Output file path.
 * @param {string} type - Output type specified by the user.
 * @returns {string} Detected output type ('json' or 'yaml').
 */
function detectOutputFormat(output, type) {
    if (type) {
        return type;
    } else if (output) {
        const ext = path.parse(output).ext;
        if (ext === '.json') {
            return 'json';
        } else if (ext.match(/^\.?(yaml|yml)$/)) {
            return 'yaml';
        } else {
            console.error('ERROR: Cannot detect output file type from file name (please set -t <type>): ' + output);
            process.exit(1);
        }
    }
    return 'json';
}

/**
 * Validates the input schema against the appropriate JSON Schema meta-schema.
 * @param {Object} schema - The JSON schema to validate.
 * @param {string} schemaVersion - The JSON Schema version (e.g., '2020-12', 'draft-07').
 * @throws Will throw an error if the schema is invalid or the version is unsupported.
 */
function validateSchemaMeta(schema, schemaVersion) {
    let ajv;

    if (schemaVersion === '2020-12') {
        ajv = new Ajv2020();
    } else if (schemaVersion === 'draft-07') {
        ajv = new Ajv();
        ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-07.json'));
    } else {
        throw new Error(`Unsupported schema version: ${schemaVersion}`);
    }

    const validate = ajv.compile(ajv.getSchema('$schema') || {});

    if (!validate(schema)) {
        throw new Error('Schema meta-validation failed: ' + JSON.stringify(validate.errors, null, 2));
    }
}

/**
 * Detects the JSON Schema version from the $schema property.
 * @param {Object} schema - The JSON schema.
 * @returns {string} The detected schema version (e.g., '2020-12', 'draft-07').
 */
function detectSchemaVersion(schema) {
    const schemaUrl = schema.$schema;

    if (!schemaUrl) {
        console.warn('No $schema property found. Defaulting to draft-07 schema.');
        return 'draft-07';
    }

    if (schemaUrl.includes('draft/2020-12')) {
        return '2020-12';
    } else if (schemaUrl.includes('draft-07')) {
        return 'draft-07';
    } else {
        throw new Error('Unsupported $schema property in the JSON Schema: ' + schemaUrl);
    }
}

/**
 * Writes the resolved schema to the specified output or stdout.
 * @param {string} output - Output file path.
 * @param {string} data - Resolved schema data.
 */
function writeOutput(output, data) {
    if (output) {
        fs.writeFileSync(output, data, { encoding: 'utf8', flag: 'w' });
        console.warn('Wrote file: ' + output);
    } else {
        console.log(data);
    }
}

/**
 * Main function to dereference the schema.
 */
async function main() {
    const { input, output, indent, type } = validateArguments();

    console.warn('Dereferencing schema: ' + input);
    try {
        const schema = await $RefParser.dereference(input, { resolve: {} });

        if (!disableValidation) {
            const schemaVersion = detectSchemaVersion(schema);
            validateSchemaMeta(schema, schemaVersion);
        } else {
            console.warn('Schema validation is disabled.');
        }

        const outputType = detectOutputFormat(output, type);
        let data;

        if (outputType === 'json') {
            data = JSON.stringify(schema, null, indent);
        } else if (outputType === 'yaml') {
            data = yaml.dump(schema, { encoding: 'utf8', indent: indent, noRefs: true });
        } else {
            console.error('ERROR: Unsupported output file type: ' + outputType);
            process.exit(1);
        }

        writeOutput(output, data);
    } catch (err) {
        console.error('ERROR: ' + err.message);
        process.exit(1);
    }
}

main();
