import postcss from 'postcss';
import perfectionist from '../';
import {name} from '../../package.json';
/* global test, expect */

function usage (instance) {
    const input = 'h1 { color: #fff }';
    return instance.process(input).then(({css}) => {
        expect(css).toEqual('h1 {\n    color: #fff;\n}\n');
    });
}

test('can be used as a postcss plugin', () => {
    usage(postcss().use(perfectionist()));
});

test('can be used as a postcss plugin (2)', () => {
    usage(postcss([ perfectionist() ]));
});

test('can be used as a postcss plugin (3)', () => {
    usage(postcss([ perfectionist ]));
});

test('should use the postcss plugin api', () => {
    expect(perfectionist().postcssVersion).toBeTruthy();
    expect(perfectionist().postcssPlugin).toEqual(name);
});
