import postcss from 'postcss';
import ava from 'ava';
import perfectionist from '../';
import {name} from '../../package.json';

function usage (t, instance) {
    const input = 'h1 { color: #ffffff }';
    return instance.process(input).then(({css}) => {
        t.deepEqual(css, 'h1 {\n    color: #ffffff;\n}\n', 'should be consumed');
    });
}

ava('can be used as a postcss plugin', usage, postcss().use(perfectionist()));
ava('can be used as a postcss plugin (2)', usage, postcss([ perfectionist() ]));
ava('can be used as a postcss plugin (3)', usage, postcss([ perfectionist ]));

ava('should use the postcss plugin api', t => {
    t.truthy(perfectionist().postcssVersion, 'should be able to access version');
    t.deepEqual(perfectionist().postcssPlugin, name, 'should be able to access name');
});
