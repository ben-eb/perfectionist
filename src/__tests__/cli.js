import child from 'child_process';
import path from 'path';
import fs from 'fs';
import ava from 'ava';

let read = fs.readFileSync;
let fixture = path.join(__dirname, './fixtures/nested.fixture.css');

function setup (args) {
    return new Promise(resolve => {
        process.chdir(__dirname);

        let ps = child.spawn(process.execPath, [
            path.resolve(__dirname, '../../bin/cmd.js'),
        ].concat(args));

        let out = '';
        let err = '';

        ps.stdout.on('data', buffer => (out += buffer));
        ps.stderr.on('data', buffer => (err += buffer));

        ps.on('exit', code => {
            resolve([err, out, code]);
        });
    });
}

ava('cli: defaults', t => {
    return setup([fixture]).then(([err, out, code]) => {
        t.falsy(err, 'should not error');
        t.falsy(code, 'should exit with code 0');
        t.deepEqual(out, read('./fixtures/nested.expanded.css', 'utf-8'), 'should transform the css');
    });
});

ava('cli: formatter', t => {
    return setup([fixture, '--format', 'compressed']).then(([err, out, code]) => {
        t.falsy(err, 'should not error');
        t.falsy(code, 'should exit with code 0');
        t.deepEqual(out, read('./fixtures/nested.compressed.css', 'utf-8'), 'should transform the css');
    });
});

ava('cli: sourcemaps', t => {
    return setup([fixture, '--sourcemap']).then(([err, out]) => {
        t.falsy(err);
        const hasMap = /sourceMappingURL=data:application\/json;base64/.test(out);
        t.truthy(hasMap, 'should generate a sourcemap');
    });
});
