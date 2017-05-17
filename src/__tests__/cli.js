import path from 'path';
import execa from 'execa';
/* global test, expect */

const fixture = path.join(__dirname, './fixtures/nested.css');

function setup (args) {
    process.chdir(__dirname);
    return execa(path.resolve(__dirname, '../../bin/cmd.js'), args, {stripEof: false});
}

test('cli: defaults', () => {
    return setup([fixture]).then(({stdout}) => {
        expect(stdout).toMatchSnapshot();
    });
});

test('cli: formatter', () => {
    return setup([fixture, '--format', 'expanded']).then(({stdout}) => {
        expect(stdout).toMatchSnapshot();
    });
});

test('cli: sourcemaps', () => {
    return setup([fixture, '--sourcemap']).then(({stdout}) => {
        const hasMap = /sourceMappingURL=data:application\/json;base64/.test(stdout);
        expect(hasMap).toBeTruthy();
    });
});
