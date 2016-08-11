import path from 'path';
import fs from 'fs';
import ava from 'ava';
import postcss from 'postcss';
import plugin from '../';

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
    ava(`fixture: ${name}`, t => {
        t.plan(3);
        Object.keys(spec).slice(0, 3).forEach(s => {
            let result = perfectionist(spec.fixture, {format: s});
            t.deepEqual(result, spec[s], `should output the expected result (${s})`);
        });
    });
});

const scss = (css, format) => {
    return plugin.process(css, {
        format: format,
        syntax: 'scss',
    }).css;
};

ava('should handle single line comments', t => {
    const input = 'h1{\n  // test \n  color: red;\n}\n';
    t.deepEqual(scss(input, 'expanded'), 'h1 {\n    // test \n    color: red;\n}\n');
    t.deepEqual(scss(input, 'compact'), 'h1 {/* test */ color: red; }\n');
    t.deepEqual(scss(input, 'compressed'), 'h1{/* test */color:red}');
});

ava('should handle single line comments in @import', t => {
    const css = 'a, a:visited {\n    //@include border-radius(5px);\n    @include transition(background-color 0.2s ease);\n}\n';
    t.deepEqual(scss(css), css);
});

let ensureRed = postcss.plugin('ensure-red', () => {
    return css => {
        let rule = postcss.rule({selector: '*'});
        rule.append(postcss.decl({
            prop: 'color',
            value: 'red',
            important: true,
        }));
        css.append(rule);
    };
});

function handleRaws (t, opts = {}) {
    return postcss([ensureRed, plugin(opts)]).process('h1 { color: blue }').then(({css}) => {
        t.falsy(!!~css.indexOf('undefined'));
    });
}

ava('should handle declarations added without raw properties (default)', handleRaws);
ava('should handle declarations added without raw properties (compact)', handleRaws, {format: 'compact'});
ava('should handle declarations added without raw properties (compressed)', handleRaws, {format: 'compressed'});
