"use strict";

import test from 'tape';
import plugin from '../';

let tests = [{
    message: 'should have a configurable indent size',
    fixture: 'h1{color:black}',
    expected: 'h1 {\n  color: black;\n}\n',
    options: {indentSize: 2}
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
