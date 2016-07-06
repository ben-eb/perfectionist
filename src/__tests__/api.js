'use strict';

import postcss from 'postcss';
import ava from 'ava';
import perfectionist from '../';
import pkg from '../../package.json';

let name = pkg.name;

ava('can be used as a postcss plugin', t => {
    let css = 'h1 { color: #ffffff }';

    return postcss().use(perfectionist()).process(css).then(result => {
        t.deepEqual(result.css, 'h1 {\n    color: #ffffff;\n}\n', 'should be consumed');
    });
});

ava('can be used as a postcss plugin (2)', t => {
    let css = 'h1 { color: #ffffff }';

    return postcss([ perfectionist() ]).process(css).then(result => {
        t.deepEqual(result.css, 'h1 {\n    color: #ffffff;\n}\n', 'should be consumed');
    });
});

ava('can be used as a postcss plugin (3)', t => {
    let css = 'h1 { color: #ffffff }';

    return postcss([ perfectionist ]).process(css).then(result => {
        t.deepEqual(result.css, 'h1 {\n    color: #ffffff;\n}\n', 'should be consumed');
    });
});

ava('should use the postcss plugin api', t => {
    t.truthy(perfectionist().postcssVersion, 'should be able to access version');
    t.deepEqual(perfectionist().postcssPlugin, name, 'should be able to access name');
});
