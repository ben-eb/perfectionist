import postcss from 'postcss';
import {block as commentRegex} from 'comment-regex';
import applyTransformFeatures from './applyTransformFeatures';
import blank from './blank';
import getIndent from './getIndent';
import isSassVariable from './isSassVariable';
import longest from './longest';
import {maxAtRuleLength, maxSelectorLength, maxValueLength} from './maxSelectorLength';
import prefixedDecls from './prefixedDecls';
import space from './space';
import sameLine from './sameLine';

const {unprefixed} = postcss.vendor;

export default function applyExpanded (css, opts) {
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
                rule.raws.important = ' !important';
            }

            // Format `!default`, `!global` and more similar values.
            if (rule.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
                rule.value = rule.value.replace(/\s*!\s*(\w+)\s*$/i, ' !$1');
            }

            if (rule.raws.value) {
                rule.raws.value.raw = rule.value;
            }

            applyTransformFeatures(rule, opts);
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
                let base = unprefixed(prop);
                if (!~props.indexOf(base)) {
                    return props.push(base);
                }
                return false;
            });
            prefixed.forEach(prefix => {
                let base = unprefixed(prefix.prop);
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
