import {block as commentRegex} from 'comment-regex';
import postcss from 'postcss';
import defined from 'defined';
import deeplyNested from './deeplyNested';
import getIndent from './getIndent';
import longest from './longest';
import {maxAtRuleLength, maxSelectorLength, maxValueLength} from './maxSelectorLength';
import prefixedDecls from './prefixedDecls';
import space from './space';
import sameLine from './sameLine';

let unprefix = postcss.vendor.unprefixed;

function isSassVariable (decl) {
    return decl.parent.type === 'root' && decl.prop.match(/^\$/);
}

function blank (value) {
    return defined(value, '');
}

function applyCompressed (css) {
    css.walk(rule => {
        rule.raws.semicolon = false;
        if (rule.type === 'comment' && rule.raws.inline) {
            rule.raws.inline = null;
        }
        if (rule.type === 'rule' || rule.type === 'atrule') {
            rule.raws.between = rule.raws.after = '';
        }
        if (rule.type === 'decl' && !commentRegex().test(rule.raws.between)) {
            rule.raws.between = ':';
        }
        if (rule.type === 'decl') {
            if (rule.raws.value) {
                rule.value = rule.raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                rule.raws.before = '';
                rule.raws.between = ':';
                rule.value = rule.value.trim().replace(/\s+/g, ' ');
            }

            // Remove spaces before commas and keep only one space after.
            rule.value = rule.value.replace(/(\s+)?,(\s)*/g, ',');
            rule.value = rule.value.replace(/\(\s*/g, '(');
            rule.value = rule.value.replace(/\s*\)/g, ')');


            // Format `!important`
            if (rule.important) {
                rule.raws.important = '!important';
            }

            // Format `!default`, `!global` and more similar values.
            if (rule.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
                rule.value = rule.value.replace(/\s*!\s*(\w+)\s*$/i, '!$1');
            }

            if (rule.raws.value) {
                rule.raws.value.raw = rule.value;
            }
        }
    });
    // Remove final newline
    css.raws.after = '';
}

function applyCompact (css, opts) {
    css.walk(rule => {
        if (rule.type === 'decl') {
            if (rule.raws.value) {
                rule.value = rule.raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                rule.raws.before = '';
                rule.raws.between = ': ';
                rule.value = rule.value.trim().replace(/\s+/g, ' ');
            }

            // Remove spaces before commas and keep only one space after.
            rule.value = rule.value.replace(/(\s*,\s*)(?=(?:[^"']|['"][^"']*["'])*$)/g, ', ');
            rule.value = rule.value.replace(/\(\s*/g, '( ');
            rule.value = rule.value.replace(/\s*\)/g, ' )');
            // Remove space after comma in data-uri
            rule.value = rule.value.replace(/(data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,)\s+/g, '$1');

            // Format `!important`
            if (rule.important) {
                rule.raws.important = " !important";
            }

            // Format `!default`, `!global` and more similar values.
            if (rule.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
                rule.value = rule.value.replace(/\s*!\s*(\w+)\s*$/i, ' !$1');
            }

            if (rule.raws.value) {
                rule.raws.value.raw = rule.value;
            }
        }
        opts.indentSize = 1;
        if (rule.type === 'comment') {
            if (rule.raws.inline) {
                rule.raws.inline = null;
            }
            let prev = rule.prev();
            if (prev && prev.type === 'decl') {
                rule.raws.before = ' ' + blank(rule.raws.before);
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
            rule.raws.before = indent + blank(rule.raws.before);
            rule.raws.semicolon = true;
        }
        if (rule.raws.selector && rule.raws.selector.raw) {
            rule.selector = rule.raws.selector.raw;
        }
        maxSelectorLength(rule, opts);
        if (rule.type === 'decl') {
            if (deeplyNested(rule.parent)) {
                let newline = rule === css.first ? '' : '\n';
                rule.raws.before = newline + indent + blank(rule.raws.before);
            } else {
                rule.raws.before = ' ' + blank(rule.raws.before);
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
    css.walk(rule => {
        if (rule.type === 'decl') {
            if (rule.raws.value) {
                rule.value = rule.raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                if (rule !== css.first) {
                    rule.raws.before = '\n';
                }
                rule.raws.between = ': ';
            }

            rule.value = rule.value.trim().replace(/\s+/g, ' ');
            // Remove spaces before commas and keep only one space after.
            rule.value = rule.value.replace(/(\s*,\s*)(?=(?:[^"']|['"][^"']*["'])*$)/g, ', ');
            rule.value = rule.value.replace(/\(\s*/g, '(');
            rule.value = rule.value.replace(/\s*\)/g, ')');
            // Remove space after comma in data-uri
            rule.value = rule.value.replace(/(data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,)\s+/g, '$1');

            // Format `!important`
            if (rule.important) {
                rule.raws.important = " !important";
            }

            // Format `!default`, `!global` and more similar values.
            if (rule.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
                rule.value = rule.value.replace(/\s*!\s*(\w+)\s*$/i, ' !$1');
            }

            if (rule.raws.value) {
                rule.raws.value.raw = rule.value;
            }
        }
        let indent = getIndent(rule, opts.indentSize);
        if (rule.type === 'comment') {
            let prev = rule.prev();
            if (prev && prev.type === 'decl') {
                if (sameLine(prev, rule)) {
                    rule.raws.before = ' ' + blank(rule.raws.before);
                } else {
                    rule.raws.before = '\n' + indent + blank(rule.raws.before);
                }
            }
            if (!prev && rule !== css.first) {
                rule.raws.before = '\n' + indent + blank(rule.raws.before);
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
        rule.raws.before = indent + blank(rule.raws.before);
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
                        decl.raws.before = space(extraSpace) + blank(decl.raws.before);
                    }
                });
            });
        }
        if (rule.raws.selector && rule.raws.selector.raw) {
            rule.selector = rule.raws.selector.raw;
        }
        maxSelectorLength(rule, opts);
        if (rule.type === 'atrule') {
            if (rule.params) {
                rule.raws.afterName = ' ';
            }
            maxAtRuleLength(rule, opts);
        }
        if (rule.type === 'decl') {
            if (!commentRegex().test(rule.raws.between)) {
                rule.raws.between = ': ';
            }
            maxValueLength(rule, opts);
        }
        if (rule.parent && rule.parent.type !== 'root') {
            rule.raws.before = '\n' + blank(rule.raws.before);
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

const perfectionist = postcss.plugin('perfectionist', opts => {
    opts = {
        format: 'expanded',
        indentSize: 4,
        maxAtRuleLength: 80,
        maxSelectorLength: 80,
        maxValueLength: 80,
        cascade: true,
        ...opts,
    };
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
        default:
            applyExpanded(css, opts);
            break;
        }
    };
});

perfectionist.process = (css, opts = {}) => {
    opts.map = opts.map || (opts.sourcemap ? true : null);
    if (opts.syntax === 'scss') {
        opts.syntax = require('postcss-scss');
    }
    let processor = postcss([ perfectionist(opts) ]);
    return processor.process(css, opts);
};

export default perfectionist;
