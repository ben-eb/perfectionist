import {list} from 'postcss';
import space from './space';
import getIndent from './getIndent';

function splitProperty (rule, prop, opts) {
    const {breakEvery, reindent, reduce, max} = {
        reindent: false,
        ...opts,
    };
    const property = rule[prop];
    if (!max || !property) {
        return;
    }
    const exploded = list.comma(property);
    if (property.length > max || reduce) {
        let indent = 0;
        if (typeof reindent === 'function') {
            indent = reindent(rule);
        }
        rule[prop] = exploded.reduce((lines, chunk) => {
            if (breakEvery) {
                lines.push(chunk);
                return lines;
            }
            if (lines[lines.length - 1].length + indent <= max) {
                const merged = `${lines[lines.length - 1]}, ${chunk}`;
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
        max,
        breakEvery: true,
        reindent: function (r) {
            return r.name.length + 2;
        },
    });
}

export function maxSelectorLength (rule, opts) {
    return splitProperty(rule, 'selector', {
        max: opts.maxSelectorLength,
        reduce: true, // where possible reduce to one line
        reindent: function (r) {
            return getIndent(r, opts.indentChar, opts.indentSize).length;
        },
    });
}

export function maxValueLength (rule, {maxValueLength: max}) {
    if (rule.raws.value && rule.raws.value.raw) {
        // ?? all tests pass without this line
        rule.value = rule.raws.value.raw;
    }
    return splitProperty(rule, 'value', {
        max,
        breakEvery: true,
        reindent: function (r) {
            return getIndent(r).length + r.prop.length + 2;
        },
    });
}
