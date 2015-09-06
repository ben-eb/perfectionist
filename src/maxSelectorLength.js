'use strict';

import {list} from 'postcss';
import space from './space';
import getIndent from './getIndent';
import assign from 'object-assign';

function splitProperty (rule, prop, opts) {
    opts = assign({
        reindent: false
    }, opts);
    let max = opts.max;
    let property = rule[prop];
    if (!max || !property) { return; }
    let exploded = list.comma(property);
    if (property.length > max || opts.reduce) {
        let indent = 0;
        if (typeof opts.reindent === 'function') {
            indent = opts.reindent(rule);
        }
        rule[prop] = exploded.reduce((lines, chunk) => {
            if (opts.breakEvery) {
                lines.push(chunk);
                return lines;
            }
            if (lines[lines.length - 1].length + indent <= max) {
                let merged = lines[lines.length - 1] + ', ' + chunk;
                if (indent + merged.length <= max) {
                    lines[lines.length - 1] = merged;
                    return lines;
                }
            }
            lines.push(chunk);
            return lines;
        }, [exploded.shift()]).join(',\n' + space(indent));
    }
}

export function maxAtRuleLength (rule, {maxAtRuleLength: max}) {
    return splitProperty(rule, 'params', {
        max: max,
        breakEvery: true,
        reindent: function (rule) {
            return rule.name.length + 2;
        }
    });
}

export function maxSelectorLength (rule, opts) {
    return splitProperty(rule, 'selector', {
        max: opts.maxSelectorLength,
        reduce: true, // where possible reduce to one line
        reindent: function (rule) {
            return getIndent(rule, opts.indentSize).length;
        }
    });
}

export function maxValueLength (rule, {maxValueLength: max}) {
    if (rule.raws.value && rule.raws.value.raw) {
        rule.value = rule.raws.value.raw;
    }
    return splitProperty(rule, 'value', {
        max: max,
        breakEvery: true,
        reindent: function (rule) {
            return getIndent(rule).length + rule.prop.length + 2;
        }
    });
}
