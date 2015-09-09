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
import sameLine from './sameLine';

let unprefix = postcss.vendor.unprefixed;

function isSassVariable (decl) {
    return decl.parent.type === 'root' && decl.prop.match(/^\$/);
}

function applyCompressed (css) {
    css.walkDecls(decl => {
        // Format sass variable `$size: 30em;`
        if (isSassVariable(decl)) {
            decl.raws.before = '';
            decl.raws.between = ':';
            decl.value = decl.value.trim().replace(/\s+/g, ' ');
        }

        // Remove spaces before commas and keep only one space after.
        decl.value = decl.value.replace(/(\s+)?,(\s)*/g, ',');
        decl.value = decl.value.replace(/\(\s*/g, '(');
        decl.value = decl.value.replace(/\s*\)/g, ')');


        // Format `!important`
        if (decl.important) {
            decl.raws.important = "!important";
        }

        // Format `!default`, `!global` and more similar values.
        if (decl.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
            decl.value = decl.value.replace(/\s*!\s*(\w+)\s*$/i, '!$1');
        }
    });
    css.walk(rule => {
        rule.raws.semicolon = false;
        if (rule.type === 'rule' || rule.type === 'atrule') {
            rule.raws.between = rule.raws.after = '';
        }
        if (rule.type === 'decl' && !commentRegex().test(rule.raws.between)) {
            rule.raws.between = ':';
        }
    });
    // Remove final newline
    css.raws.after = '';
}

function applyCompact (css, opts) {
    css.walkDecls(decl => {
        // Format sass variable `$size: 30em;`
        if (isSassVariable(decl)) {
            decl.raws.before = '';
            decl.raws.between = ': ';
            decl.value = decl.value.trim().replace(/\s+/g, ' ');
        }

        // Remove spaces before commas and keep only one space after.
        decl.value = decl.value.replace(/(\s+)?,(\s)*/g, ', ');
        decl.value = decl.value.replace(/\(\s*/g, '( ');
        decl.value = decl.value.replace(/\s*\)/g, ' )');


        // Format `!important`
        if (decl.important) {
            decl.raws.important = " !important";
        }

        // Format `!default`, `!global` and more similar values.
        if (decl.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
            decl.value = decl.value.replace(/\s*!\s*(\w+)\s*$/i, ' !$1');
        }
    });

    css.walk(rule => {
        opts.indentSize = 1;
        if (rule.type === 'comment') {
            let prev = rule.prev();
            if (prev && prev.type === 'decl') {
                rule.raws.before = ' ' + rule.raws.before;
            }
            if (rule.parent && rule.parent.type === 'root') {
                let next = rule.next();
                if (next) {
                    next.raws.before = '\n';
                }
                if (rule !== css.first) {
                    rule.raws.before = '\n';
                }
            }
            return;
        }
        let indent = getIndent(rule, opts.indentSize);
        let deep = deeplyNested(rule);
        if (rule.type === 'rule' || rule.type === 'atrule') {
            if (!rule.nodes) {
                rule.raws.between = '';
            } else {
                rule.raws.between = ' ';
            }
            rule.raws.after = ' ';
            rule.raws.before = indent + rule.raws.before;
            rule.raws.semicolon = true;
        }
        if (rule.raws.selector && rule.raws.selector.raw) {
            rule.selector = rule.raws.selector.raw;
        }
        maxSelectorLength(rule, opts);
        if (rule.type === 'decl') {
            if (deeplyNested(rule.parent)) {
                rule.raws.before = '\n' + indent + rule.raws.before;
            } else {
                rule.raws.before = ' ' + rule.raws.before;
            }
            if (!commentRegex().test(rule.raws.between)) {
                rule.raws.between = ': ';
            }
        }
        if ((deep || rule.nodes) && rule !== css.first) {
            rule.raws.before = '\n ';
        }
        if (deep) {
            rule.raws.after = '\n' + indent;
        }
        if (rule.parent && rule !== rule.parent.first && (rule.type === 'rule' || rule.type === 'atrule')) {
            rule.raws.before = '\n' + indent;
        }
    });
    css.raws.after = '\n';
}

function applyExpanded (css, opts) {
    css.walkDecls(decl => {
        // Format sass variable `$size: 30em;`
        if (isSassVariable(decl)) {
            decl.raws.before = '\n';
            decl.raws.between = ': ';
        }

        decl.value = decl.value.trim().replace(/\s+/g, ' ');
        // Remove spaces before commas and keep only one space after.
        decl.value = decl.value.replace(/(\s+)?,(\s)*/g, ', ');
        decl.value = decl.value.replace(/\(\s*/g, '(');
        decl.value = decl.value.replace(/\s*\)/g, ')');


        // Format `!important`
        if (decl.important) {
            decl.raws.important = " !important";
        }

        // Format `!default`, `!global` and more similar values.
        if (decl.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
            decl.value = decl.value.replace(/\s*!\s*(\w+)\s*$/i, ' !$1');
        }
    });

    css.walk(rule => {
        let indent = getIndent(rule, opts.indentSize);
        if (rule.type === 'comment') {
            let prev = rule.prev();
            if (prev && prev.type === 'decl') {
                if (sameLine(prev, rule)) {
                    rule.raws.before = ' ' + rule.raws.before;
                } else {
                    rule.raws.before = '\n' + indent + rule.raws.before;
                }
            }
            if (rule.parent && rule.parent.type === 'root') {
                let next = rule.next();
                if (next) {
                    next.raws.before = '\n\n';
                }
                if (rule !== css.first) {
                    rule.raws.before = '\n\n';
                }
            }
            return;
        }
        rule.raws.before = indent + rule.raws.before;
        if (rule.type === 'rule' || rule.type === 'atrule') {
            if (!rule.nodes) {
                rule.raws.between = '';
            } else {
                rule.raws.between = ' ';
            }
            rule.raws.semicolon = true;
            if (rule.nodes) {
                rule.raws.after = '\n';
            }
        }
        // visual cascade of vendor prefixed properties
        if (opts.cascade && rule.type === 'rule' && rule.nodes.length > 1) {
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
                        decl.raws.before = space(extraSpace) + decl.raws.before;
                    }
                });
            });
        }
        if (rule.raws.selector && rule.raws.selector.raw) {
            rule.selector = rule.raws.selector.raw;
        }
        maxSelectorLength(rule, opts);
        if (rule.type === 'atrule') {
            if (rule.params) { rule.raws.afterName = ' '; }
            maxAtRuleLength(rule, opts);
        }
        if (rule.type === 'decl') {
            if (!commentRegex().test(rule.raws.between)) {
                rule.raws.between = ': ';
            }
            maxValueLength(rule, opts);
        }
        if (rule.parent && rule.parent.type !== 'root') {
            rule.raws.before = '\n' + rule.raws.before;
            rule.raws.after = '\n' + indent;
        }
        if (rule.parent && rule !== rule.parent.first && (rule.type === 'rule' || rule.type === 'atrule')) {
            if (rule.type === 'atrule' && !rule.nodes) {
                rule.raws.before = '\n' + indent;
                return;
            }
            rule.raws.before = '\n\n' + indent;
        }
    });
    css.raws.after = '\n';
}

let perfectionist = postcss.plugin('perfectionist', opts => {
    opts = assign({
        format: 'expanded',
        indentSize: 4,
        maxAtRuleLength: 80,
        maxSelectorLength: 80,
        maxValueLength: 80,
        cascade: true
    }, opts);
    return css => {
        css.walk(node => {
            if (node.raws.before) {
                node.raws.before = node.raws.before.replace(/[;\s]/g, '');
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
