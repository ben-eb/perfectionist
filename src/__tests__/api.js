'use strict';

import postcss from 'postcss';
import tape from 'tape';
import perfectionist from '../';
import pkg from '../../package.json';

let name = pkg.name;

tape('can be used as a postcss plugin', t => {
    t.plan(1);

    let css = 'h1 { color: #ffffff }';

    postcss().use(perfectionist()).process(css).then(result => {
        t.equal(result.css, 'h1 {\n    color: #ffffff;\n}\n', 'should be consumed');
    });
});

tape('can be used as a postcss plugin (2)', t => {
    t.plan(1);

    let css = 'h1 { color: #ffffff }';

    postcss([ perfectionist() ]).process(css).then(result => {
        t.equal(result.css, 'h1 {\n    color: #ffffff;\n}\n', 'should be consumed');
    });
});

tape('can be used as a postcss plugin (3)', t => {
    t.plan(1);

    let css = 'h1 { color: #ffffff }';

    postcss([ perfectionist ]).process(css).then(result => {
        t.equal(result.css, 'h1 {\n    color: #ffffff;\n}\n', 'should be consumed');
    });
});

tape('should use the postcss plugin api', t => {
    t.plan(2);
    t.ok(perfectionist().postcssVersion, 'should be able to access version');
    t.equal(perfectionist().postcssPlugin, name, 'should be able to access name');
});
