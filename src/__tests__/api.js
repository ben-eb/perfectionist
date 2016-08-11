'use strict';

import postcss from 'postcss';
import ava from 'ava';
import perfectionist from '../';
import pkg from '../../package.json';

let name = pkg.name;

ava('can be used as a postcss plugin', t => {
    let css = 'h1 { color: #fff }';

    return postcss().use(perfectionist()).process(css).then(result => {
        t.same(result.css, 'h1 {\n    color: #fff;\n}\n', 'should be consumed');
    });
});

ava('can be used as a postcss plugin (2)', t => {
    let css = 'h1 { color: #fff }';

    return postcss([ perfectionist() ]).process(css).then(result => {
        t.same(result.css, 'h1 {\n    color: #fff;\n}\n', 'should be consumed');
    });
});

ava('can be used as a postcss plugin (3)', t => {
    let css = 'h1 { color: #fff }';

    return postcss([ perfectionist ]).process(css).then(result => {
        t.same(result.css, 'h1 {\n    color: #fff;\n}\n', 'should be consumed');
    });
});

ava('should use the postcss plugin api', t => {
    t.ok(perfectionist().postcssVersion, 'should be able to access version');
    t.same(perfectionist().postcssPlugin, name, 'should be able to access name');
});
