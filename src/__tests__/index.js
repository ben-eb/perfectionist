"use strict";

import test from 'tape';
import postcss from 'postcss';
import plugin from '../';
import path from 'path';
import fs from 'fs';

let base = path.join(__dirname, 'fixtures');

function perfectionist (css, options) {
    return postcss([ plugin(options) ]).process(css).css;
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
