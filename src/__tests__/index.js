import path from 'path';
import fs from 'fs';
import postcss from 'postcss';
import plugin from '../';
/* global test, expect */

let base = path.join(__dirname, 'fixtures');

function perfectionist (css, options) {
    return plugin.process(css, options).css;
}

let specs = fs.readdirSync(base).reduce((tests, css) => {
    let [spec] = css.split('.');
    tests[spec] = fs.readFileSync(path.join(base, css), 'utf-8');
    return tests;
}, {});

Object.keys(specs).forEach(name => {
    let spec = specs[name];
    test(`fixture: ${name}`, () => {
        expect.assertions(1);
        let result = perfectionist(spec);
        expect(result).toMatchSnapshot();
    });
});

const scss = (css, format) => {
    return plugin.process(css, {
        format: format,
        syntax: 'scss',
    }).css;
};

test('should handle single line comments', () => {
    const input = 'h1{\n  // test \n  color: red;\n}\n';
    expect(scss(input, 'expanded')).toEqual('h1 {\n    // test \n    color: red;\n}\n');
});

test('should handle single line comments in @import', () => {
    const css = 'a, a:visited {\n    //@include border-radius(5px);\n    @include transition(background-color 0.2s ease);\n}\n';
    expect(scss(css)).toEqual(css);
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

function handleRaws (opts = {}) {
    return postcss([ensureRed, plugin(opts)]).process('h1 { color: blue }').then(({css}) => {
        expect(!!~css.indexOf('undefined')).toBeFalsy();
    });
}

test('should handle declarations added without raw properties (default)', (done) => {
    handleRaws().then(done);
});
