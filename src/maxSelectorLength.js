'use strict';

import {list} from 'postcss';
import space from './space';
import getIndent from './getIndent';

function splitProperty (rule, prop, max, reindent = false) {
    if (!max) { return; }
    let property = rule[prop];
    if (property && property.length > max) {
        let exploded = list.comma(property);
        let indent = 0;
        if (typeof reindent === 'function') {
            indent = reindent(rule);
        }
        rule[prop] = exploded.reduce((lines, chunk) => {
            if (lines[lines.length - 1].length + reindent <= max) {
                let merged = lines[lines.length - 1] + ', ' + chunk;
                if (merged.length <= max) {
                    lines[lines.length - 1] = merged;
                    return lines;
                }
            }
            lines.push(chunk);
            return lines;
        }, [exploded.shift()]).join(',\n' + space(indent));
    }
}

export function maxSelectorLength (rule, {maxSelectorLength: max}) {
    return splitProperty(rule, 'selector', max);
}

export function maxValueLength (rule, {maxValueLength: max}) {
    return splitProperty(rule, 'value', max, function (rule) {
        return getIndent(rule).length + rule.prop.length + 2;
    });
}
