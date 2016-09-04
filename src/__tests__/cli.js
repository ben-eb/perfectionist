import path from 'path';
import {readFileSync as read} from 'fs';
import ava from 'ava';
import execa from 'execa';

const fixture = path.join(__dirname, './fixtures/nested.fixture.css');

function setup (args) {
    process.chdir(__dirname);
    return execa(path.resolve(__dirname, '../../bin/cmd.js'), args, {stripEof: false});
}

ava('cli: defaults', t => {
    return setup([fixture]).then(({stdout}) => {
        t.deepEqual(stdout, read('./fixtures/nested.expanded.css', 'utf-8'), 'should transform the css');
    });
});

ava('cli: formatter', t => {
    return setup([fixture, '--format', 'compressed']).then(({stdout}) => {
        t.deepEqual(stdout, read('./fixtures/nested.compressed.css', 'utf-8'), 'should transform the css');
    });
});

ava('cli: sourcemaps', t => {
    return setup([fixture, '--sourcemap']).then(({stdout}) => {
        const hasMap = /sourceMappingURL=data:application\/json;base64/.test(stdout);
        t.truthy(hasMap, 'should generate a sourcemap');
    });
});
