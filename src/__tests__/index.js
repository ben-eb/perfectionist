"use strict";

import test from 'tape';
import plugin from '../';
import path from 'path';
import fs from 'fs';

let base = path.join(__dirname, 'fixtures');

function perfectionist (css, options) {
    return plugin.process(css, options).css;
}

let specs = fs.readdirSync(base).reduce((tests, css) => {
    let [spec, style] = css.split('.');
    if (!tests[spec]) {
        tests[spec] = {};
    }
    tests[spec][style] = fs.readFileSync(path.join(base, css), 'utf-8');
    return tests;
}, {});

Object.keys(specs).forEach(name => {
    let spec = specs[name];
    test(`fixture: ${name}`, t => {
        t.plan(3);
        Object.keys(spec).slice(0, 3).forEach(s => {
            let result = perfectionist(spec.fixture, {format: s});
            t.equal(result, spec[s], `should output the expected result (${s})`);
        });
    });
});

test('should handle single line comments in compressed/compact styles', t => {
    t.plan(2);

    let scss = (css, format) => {
        return plugin.process(css, {
            format: format,
            syntax: require('postcss-scss')
        }).css;
    };

    t.equal(scss('h1{\n  // test \n  color: red;\n}\n', 'compact'), 'h1 {/* test */ color: red; }\n');
    t.equal(scss('h1{\n  // test \n  color: red;\n}\n', 'compressed'), 'h1{/* test */color:red}');
});
