import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
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
import walk from './walk';

const {unprefixed} = postcss.vendor;

export default function applyExpanded (css, opts) {
    css.walk(rule => {
        const {raws, type} = rule;
        if (type === 'decl') {
            if (raws.value) {
                rule.value = raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                if (rule !== css.first) {
                    rule.raws.before = '\n';
                }
                rule.raws.between = ': ';
            }

            const ast = valueParser(rule.value);

            walk(ast, (node, index, parent) => {
                const next = parent.nodes[index + 1];
                if (node.type === 'function') {
                    node.before = node.after = '';
                }
                if (node.type === 'div' && node.value === ',') {
                    node.before = '';
                    node.after = ' ';
                }
                if (node.type === 'space') {
                    node.value = ' ';
                }
                if (
                    node.type === 'word' &&
                    node.value === '!' &&
                    parent.nodes[index + 2] &&
                    next.type === 'space' &&
                    parent.nodes[index + 2].type === 'word'
                ) {
                    next.type = 'word';
                    next.value = '';
                }
                if (node.type === 'word') {
                    applyTransformFeatures(node, opts);
                }
            });

            rule.value = ast.toString();

            // Format `!important`
            if (rule.important) {
                rule.raws.important = ' !important';
            }

            if (raws.value) {
                rule.raws.value.raw = rule.value;
            }
        }
        let indent = getIndent(rule, opts.indentChar, opts.indentSize);
        if (type === 'comment') {
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
        if (type === 'rule' || type === 'atrule') {
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
        if (opts.cascade && type === 'rule' && rule.nodes.length > 1) {
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
        if (raws.selector && raws.selector.raw) {
            rule.selector = rule.raws.selector.raw;
        }
        maxSelectorLength(rule, opts);
        if (type === 'atrule') {
            if (rule.params) {
                rule.raws.afterName = ' ';
            }
            maxAtRuleLength(rule, opts);
        }
        if (type === 'decl') {
            if (!commentRegex().test(rule.raws.between)) {
                rule.raws.between = ': ';
            }
            maxValueLength(rule, opts);
        }
        if (rule.parent && rule.parent.type !== 'root') {
            rule.raws.before = '\n' + blank(rule.raws.before);
            rule.raws.after = '\n' + indent;
        }
        if (rule.parent && rule !== rule.parent.first && (type === 'rule' || type === 'atrule')) {
            if (type === 'atrule' && !rule.nodes) {
                rule.raws.before = '\n' + indent;
                return;
            }
            rule.raws.before = '\n\n' + indent;
        }
    });
    css.raws.after = '\n';
}
