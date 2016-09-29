import {block as commentRegex} from 'comment-regex';
import valueParser from 'postcss-value-parser';
import applyTransformFeatures from './applyTransformFeatures';
import blank from './blank';
import deeplyNested from './deeplyNested';
import getIndent from './getIndent';
import isSassVariable from './isSassVariable';
import {maxSelectorLength} from './maxSelectorLength';
import walk from './walk';

export default function applyCompact (css, opts) {
    css.walk(rule => {
        if (rule.type === 'decl') {
            if (rule.raws.value) {
                rule.value = rule.raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                rule.raws.before = '';
                rule.raws.between = ': ';
            }

            const ast = valueParser(rule.value);

            walk(ast, (node, index, parent) => {
                const next = parent.nodes[index + 1];
                if (node.type === 'div' && node.value === ',') {
                    node.before = '';
                    node.after = ' ';
                }
                if (node.type === 'function') {
                    node.before = node.after = ' ';
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
