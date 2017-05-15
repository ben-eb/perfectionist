import formatDeclaration from './formatDeclaration';
import formatComment from './formatComment';
import formatRule from './formatRule';
import formatAtRule from './formatAtRule';

export default function applyExpanded (css, opts) {
    // remove whitespace & semicolons from beginning
    css.walk(rule => {
        if (rule.raws.before) {
            rule.raws.before = rule.raws.before.replace(/[;\s]/g, '');
        }
    });

    css.walk(rule => {
        switch (rule.type) {
        case 'decl':
            return formatDeclaration(rule, opts, css);
        case 'comment':
            return formatComment(rule, opts, css);
        case 'rule':
            return formatRule(rule, opts, css);
        case 'atrule':
            return formatAtRule(rule, opts, css);
        }
    });
    css.raws.after = '\n';
}
