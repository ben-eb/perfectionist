"use strict";

import test from 'tape';
import plugin from '../';
import path from 'path';
import fs from 'fs';
import postcss from 'postcss';

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

test('should handle single line comments', t => {
    t.plan(3);

    let scss = (css, format) => {
        return plugin.process(css, {
            format: format,
            syntax: 'scss'
        }).css;
    };

    t.equal(scss('h1{\n  // test \n  color: red;\n}\n', 'expanded'), 'h1 {\n    // test \n    color: red;\n}\n');
    t.equal(scss('h1{\n  // test \n  color: red;\n}\n', 'compact'), 'h1 {/* test */ color: red; }\n');
    t.equal(scss('h1{\n  // test \n  color: red;\n}\n', 'compressed'), 'h1{/* test */color:red}');
});

test('should handle declarations added without raw properties', t => {
    t.plan(3);

    let ensureRed = postcss.plugin('ensure-red', () => {
        return css => {
            let rule = postcss.rule({selector: '*'});
            rule.append(postcss.decl({
                prop: 'color',
                value: 'red',
                important: true
            }));
            css.append(rule);
        };
    });

    postcss([ ensureRed, plugin ]).process('h1 { color: blue }').then(result => {
        t.notOk(!!~result.css.indexOf('undefined'));
    });

    postcss([ ensureRed, plugin({format: 'compact'}) ]).process('h1 { color: blue }').then(result => {
        t.notOk(!!~result.css.indexOf('undefined'));
    });

    postcss([ ensureRed, plugin({format: 'compressed'}) ]).process('h1 { color: blue }').then(result => {
        t.notOk(!!~result.css.indexOf('undefined'));
    });
});
