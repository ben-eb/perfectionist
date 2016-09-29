import {block as commentRegex} from 'comment-regex';
import valueParser from 'postcss-value-parser';
import applyTransformFeatures from './applyTransformFeatures';
import isSassVariable from './isSassVariable';
import walk from './walk';

export default function applyCompressed (css, opts) {
    css.walk(rule => {
        const {raws, type} = rule;
        rule.raws.semicolon = false;
        if (type === 'comment' && raws.inline) {
            rule.raws.inline = null;
        }
        if (type === 'rule' || type === 'atrule') {
            rule.raws.between = rule.raws.after = '';
        }
        if (type === 'decl' && !commentRegex().test(raws.between)) {
            rule.raws.between = ':';
        }
        if (rule.type === 'decl') {
            if (raws.value) {
                rule.value = raws.value.raw.trim();
            }

            const ast = valueParser(rule.value);

            walk(ast, (node, index, parent) => {
                const next = parent.nodes[index + 1];
                if (node.type === 'div' && node.value === ',' || node.type === 'function') {
                    node.before = node.after = '';
                }
                if (node.type === 'space') {
                    node.value = ' ';
                    if (next.type === 'word' && next.value[0] === '!') {
                        node.value = '';
                    }
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

            if (isSassVariable(rule)) {
                rule.raws.before = '';
            }

            // Format `!important`
            if (rule.important) {
                rule.raws.important = '!important';
            }

            if (raws.value) {
                rule.raws.value.raw = rule.value;
            }
        }
    });
    // Remove final newline
    css.raws.after = '';
}
