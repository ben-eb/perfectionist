"use strict";

import test from 'tape';
import plugin from '../';

let tests = [{
    message: 'should have a configurable indent size',
    fixture: 'h1{color:black}',
    expected: 'h1 {\n  color: black;\n}\n',
    options: {indentSize: 2}
}, {
    message: 'should allow disabling of the cascade',
    fixture: 'h1{-webkit-border-radius: 12px; border-radius: 12px; }',
    expected: 'h1 {\n    -webkit-border-radius: 12px;\n    border-radius: 12px;\n}\n',
    options: {cascade: false}
}];

function perfectionist (css, options) {
    return plugin.process(css, options).css;
}

test('perfectionist options', (t) => {
    t.plan(tests.length);

    tests.forEach(test => {
        let options = test.options || {};
        t.equal(perfectionist(test.fixture, options), test.expected);
    });
});
