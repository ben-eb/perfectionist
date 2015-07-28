'use strict';

import postcss from 'postcss';
import deeplyNested from './deeplyNested';
import getIndent from './getIndent';
import longest from './longest';
import maxSelectorLength from './maxSelectorLength';
import prefixedDecls from './prefixedDecls';
import space from './space';

let comma = postcss.list.comma;
let unprefix = postcss.vendor.unprefixed;

function applyCompressed (css) {
    css.eachInside(rule => {
        rule.between = rule.after = '';
        rule.semicolon = false;
        if (rule.type === 'decl') {
            rule.between = ':';
        }
    });
    // Remove final newline
    css.after = '';
}

function applyCompact (css, opts) {
    css.eachInside(rule => {
        if (rule.type === 'comment') {
            if (rule.prev() && rule.prev().type === 'decl') {
                rule.before = ' ' + rule.before;
            }
            if (rule.parent && rule.parent.type === 'root') {
                rule.next().before = '\n';
                if (rule !== css.first) {
                    rule.before = '\n';
                }
            }
            return;
        }
        let indent = getIndent(rule, 1);
        let deep = deeplyNested(rule);
        if (rule.type === 'rule' || rule.type === 'atrule') {
            rule.between = rule.after = ' ';
            rule.before = indent + rule.before;
            rule.semicolon = true;
        }
        maxSelectorLength(rule, opts);
        if (rule.type === 'decl') {
            if (deeplyNested(rule.parent)) {
                rule.before = '\n' + indent + rule.before;
            } else {
                rule.before = ' ' + rule.before;
            }
            rule.between = ': ';
        }
        if ((deep || rule.nodes) && rule !== css.first) {
            rule.before = '\n ';
        }
        if (deep) {
            rule.after = '\n' + indent;
        }
        if (rule.parent && rule !== rule.parent.first && rule.type === 'rule') {
            rule.before = '\n' + indent;
        }
    });
    css.after = '\n';
}

function applyExpanded (css, opts) {
    css.eachInside(rule => {
        if (rule.type === 'comment') {
            if (rule.prev() && rule.prev().type === 'decl') {
                rule.before = ' ' + rule.before;
            }
            if (rule.parent && rule.parent.type === 'root') {
                rule.next().before = '\n\n';
                if (rule !== css.first) {
                    rule.before = '\n\n';
                }
            }
            return;
        }
        let indent = getIndent(rule);
        rule.before = indent + rule.before;
        if (rule.type === 'rule' || rule.type === 'atrule') {
            rule.between = ' ';
            rule.semicolon = true;
            if (rule.nodes) {
                rule.after = '\n';
            }
        }
        // visual cascade of vendor prefixed properties
        if (rule.type === 'rule' && rule.nodes.length > 1) {
            let props = [];
            let prefixed = prefixedDecls(rule).sort(longest).filter(({prop}) => {
                let base = unprefix(prop);
                if (!~props.indexOf(base)) {
                    return props.push(base);
                }
                return false;
            });
            prefixed.forEach(prefix => {
                let base = unprefix(prefix.prop);
                let vendor = prefix.prop.replace(base, '').length;
                rule.nodes.filter(({prop}) => prop && ~prop.indexOf(base)).forEach(decl => {
                    let thisVendor = decl.prop.replace(base, '').length;
                    let extraSpace = vendor - thisVendor;
                    if (extraSpace > 0) {
                        decl.before = space(extraSpace) + decl.before;
                    }
                });
            });
        }
        maxSelectorLength(rule, opts);
        if (rule.type === 'decl') {
            rule.before = rule.before;
            rule.between = ': ';
            let values = comma(rule.value);
            if (values.length > 1) {
                rule.value = values.map((value, index) => {
                    if (!index) { return value; }
                    let align = space((rule.prop + rule.before).length + 2);
                    return `\n${align}${value}`;
                }).join(',');
            }
        }
        if (rule.parent && rule.parent.type !== 'root') {
            rule.before = '\n' + rule.before;
            rule.after = '\n' + indent;
        }
        if (rule.parent && rule !== rule.parent.first && rule.type === 'rule') {
            rule.before = '\n\n' + indent;
        }
    });
    css.after = '\n';
}

let perfectionist = postcss.plugin('perfectionist', ({
    format = 'expanded',
    maxSelectorLength = 80
} = {}) => {
    return (css, result) => {
        css.eachInside(rule => {
            if (rule.before) {
                rule.before = rule.before.replace(/[;\s]/g, '');
            }
        });
        switch (format) {
            case 'compact':
                applyCompact(css, {maxSelectorLength: maxSelectorLength});
                break;
            case 'compressed':
                applyCompressed(css);
                break;
            case 'expanded':
                applyExpanded(css, {maxSelectorLength: maxSelectorLength});
                break;
        }
    }
});

perfectionist.process = (css, opts = {}) => {
    opts.map = opts.map || (opts.sourcemap ? true : null);
    let processor = postcss([ perfectionist(opts) ]);
    return processor.process(css, opts);
}

export default perfectionist;
