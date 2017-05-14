import valueParser from 'postcss-value-parser';
// import {block as commentRegex} from 'comment-regex';
import applyTransformFeatures from './applyTransformFeatures';
import isSassVariable from './isSassVariable';
// import {maxSelectorLength, maxValueLength} from './maxSelectorLength';
import walk from './walk';
// import blank from './blank';
// import getIndent from './getIndent';

export default function formatDeclaration (rule, opts, css) {
    const {raws} = rule;
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
};
