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
}, {
    message: 'should convert hex colours to uppercase',
    fixture: 'h1{color:#fff}',
    expected: 'h1 {\n    color: #FFF;\n}\n',
    options: {colorCase: 'upper'},
}, {
    message: 'should expand shorthand hex',
    fixture: 'h1{color:#fff}',
    expected: 'h1 {\n    color: #ffffff;\n}\n',
    options: {colorShorthand: false},
}, {
    message: 'should expand shorthand hex',
    fixture: 'h1{color:#ffffff}',
    expected: 'h1 {\n    color: #ffffff;\n}\n',
    options: {colorShorthand: false},
}, {
    message: 'should not remove units from zero lengths',
    fixture: 'h1{width:0px}',
    expected: 'h1 {\n    width: 0px;\n}\n',
    options: {zeroLengthNoUnit: false},
}, {
    message: 'should not trim leading zeroes',
    fixture: 'h1{width:0.5px}',
    expected: 'h1 {\n    width: 0.5px;\n}\n',
    options: {trimLeadingZero: false},
}, {
    message: 'should not trim trailing zeroes',
    fixture: 'h1{width:10.000px}',
    expected: 'h1 {\n    width: 10.000px;\n}\n',
    options: {trimTrailingZeros: false},
}];

function perfectionist (css, options) {
    return plugin.process(css, options).css;
}

ava('perfectionist options', (t) => {
    tests.forEach(({fixture, expected, options}) => {
        t.deepEqual(perfectionist(fixture, options || {}), expected);
    });
});
