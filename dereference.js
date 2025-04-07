#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const $RefParser = require('@apidevtools/json-schema-ref-parser');
const argv = require('minimist')(process.argv.slice(2));
const yaml = require('js-yaml');


// Argument handling
if (!argv.s) {
    console.error('Usage: ' + process.argv[1] + ' -s <schema> [-i <spaces>] [-o <output>] [-t <type>]');
    process.exit(1);
}

var input = path.resolve(argv.s);
var output = argv.o ? path.resolve(argv.o) : undefined;
var indent = argv.i !== undefined ? argv.i : 2

// Schema dereferencing
console.warn("Dereferencing schema: " + input);
$RefParser.dereference(input, {resolve: {}}, function (err, schema) {
    if (err) {
        console.error('ERROR: ' + err);
        process.exit(1);
        return
    }

    // Detect output format
    var type = 'json'
    if (argv.t) {
        type = argv.t
    } else if (output) {
        var ext = path.parse(output).ext;

        if (ext == '.json') {
            type = 'json'
        } else if (ext.match(/^\.?(yaml|yml)$/)) {
            type = 'yaml'
        } else {
            console.error('ERROR: Cannot detect output file type from file name (please set -t <type>): ' + output);
            process.exit(1);
        }
    }

    // Generate resolved schema type
    var data = ''
    if (type == 'json') {
        data = JSON.stringify(schema, null, indent);
    } else if (type == 'yaml') {
        data = yaml.dump(schema, {encoding: 'utf8', indent: indent, noRefs: true});
    } else {
        console.error('ERROR: Unsupported output file type: ' + type);
        process.exit(1);
    }

    // Output resolved schema
    if (output) {
        fs.writeFileSync(output, data, {encoding: 'utf8', flag: 'w'});
        console.warn('Wrote file: ' + output);
    } else {
        console.log(data)
    }
});
