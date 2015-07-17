'use strict';

import tape from 'tape';
import child from 'child_process';
import path from 'path';
import fs from 'fs';

let read = fs.readFileSync;
let fixture = path.join(__dirname, './fixtures/nested.fixture.css');

function setup (args, callback) {
    process.chdir(__dirname);

    let ps = child.spawn(process.execPath, [
        path.resolve(__dirname, '../../bin/cmd.js')
    ].concat(args));

    let out = '';
    let err = '';

    ps.stdout.on('data', buffer => { out += buffer; });
    ps.stderr.on('data', buffer => { err += buffer; });

    ps.on('exit', code => {
        callback.call(this, err, out, code);
    });
}

tape('cli: defaults', t => {
    t.plan(3);

    setup([fixture], (err, out, code) => {
        t.notOk(err, 'should not error');
        t.notOk(code, 'should exit with code 0');
        t.equal(out, read('./fixtures/nested.expanded.css', 'utf-8'), 'should transform the css');
    });
});

tape('cli: formatter', t => {
    t.plan(3);

    setup([fixture, '--format', 'compressed'], (err, out, code) => {
        t.notOk(err, 'should not error');
        t.notOk(code, 'should exit with code 0');
        t.equal(out, read('./fixtures/nested.compressed.css', 'utf-8'), 'should transform the css');
    });
});

tape('cli: sourcemaps', t => {
    t.plan(1);

    setup([fixture, '--sourcemap'], (err, out) => {
        var hasMap = /sourceMappingURL=data:application\/json;base64/.test(out);
        t.ok(hasMap, 'should generate a sourcemap');
    });
});
