'use strict';

import postcss from 'postcss';
import deeplyNested from './deeplyNested';
import getIndent from './getIndent';
import longest from './longest';
import {maxAtRuleLength, maxSelectorLength, maxValueLength} from './maxSelectorLength';
import prefixedDecls from './prefixedDecls';
import space from './space';
import assign from 'object-assign';
import {block as commentRegex} from 'comment-regex';

let unprefix = postcss.vendor.unprefixed;

function applyCompressed (css) {
    css.eachInside(rule => {
        rule.semicolon = false;
        if (rule.type === 'rule' || rule.type === 'atrule') {
            rule.between = rule.after = '';
        }
        if (rule.type === 'decl' && !commentRegex().test(rule.between)) {
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
            if (!commentRegex().test(rule.between)) {
                rule.between = ': ';
            }
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
        if (rule.type === 'atrule') {
            if (rule.params) { rule.afterName = ' '; }
            maxAtRuleLength(rule, opts);
        }
        if (rule.type === 'decl') {
            if (!commentRegex().test(rule.between)) {
                rule.between = ': ';
            }
            maxValueLength(rule, opts);
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

let perfectionist = postcss.plugin('perfectionist', opts => {
    opts = assign({
        format: 'expanded',
        maxAtRuleLength: 80,
        maxSelectorLength: 80,
        maxValueLength: 80
    }, opts);
    return css => {
        css.eachInside(node => {
            if (node.before) {
                node.before = node.before.replace(/[;\s]/g, '');
            }
        });
        switch (opts.format) {
            case 'compact':
                applyCompact(css, opts);
                break;
            case 'compressed':
                applyCompressed(css);
                break;
            case 'expanded':
                applyExpanded(css, opts);
                break;
        }
    };
});

perfectionist.process = (css, opts = {}) => {
    opts.map = opts.map || (opts.sourcemap ? true : null);
    let processor = postcss([ perfectionist(opts) ]);
    return processor.process(css, opts);
};

export default perfectionist;
