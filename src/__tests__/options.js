import ava from 'ava';
import plugin from '../';

let tests = [{
    message: 'should have a configurable indent size',
    fixture: 'h1{color:black}',
    expected: 'h1 {\n  color: black;\n}\n',
    options: {indentSize: 2},
}, {
    message: 'should allow disabling of the cascade',
    fixture: 'h1{-webkit-border-radius: 12px; border-radius: 12px; }',
    expected: 'h1 {\n    -webkit-border-radius: 12px;\n    border-radius: 12px;\n}\n',
    options: {cascade: false},
}];

function perfectionist (css, options) {
    return plugin.process(css, options).css;
}

ava('perfectionist options', (t) => {
    tests.forEach(({fixture, expected, options}) => {
        t.deepEqual(perfectionist(fixture, options || {}), expected);
    });
});
