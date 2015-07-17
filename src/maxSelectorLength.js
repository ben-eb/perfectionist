'use strict';

import {list} from 'postcss';

export default function maxSelectorLength (rule, {maxSelectorLength: max}) {
    if (!max) { return; }
    if (rule.selector && rule.selector.length > max) {
        let selectors = list.comma(rule.selector);
        rule.selector = selectors.reduce((lines, selector) => {
            if (lines[lines.length - 1].length <= max) {
                let merged = lines[lines.length - 1] + ', ' + selector;
                if (merged.length <= max) {
                    lines[lines.length - 1] = merged;
                    return lines;
                }
            }
            lines.push(selector);
            return lines;
        }, [selectors.shift()]).join(',\n');
    }
}
