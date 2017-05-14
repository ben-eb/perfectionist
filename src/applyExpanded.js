import {block as commentRegex} from 'comment-regex';
import blank from './blank';
import getIndent from './getIndent';
import {maxAtRuleLength, maxSelectorLength, maxValueLength} from './maxSelectorLength';
import formatDeclaration from './formatDeclaration';
import formatComment from './formatComment';

export default function applyExpanded (css, opts) {
    // remove whitespace & semicolons from beginning
    css.walk(rule => {
        if (rule.raws.before) {
            rule.raws.before = rule.raws.before.replace(/[;\s]/g, '');
        }
    });

    css.walk(rule => {
        const {raws, type} = rule;
        if (type === 'decl') {
            formatDeclaration(rule, opts, css);
        }

        if (type === 'comment') {
            formatComment(rule, opts, css);
            return;
        }

        let indent = getIndent(rule, opts.indentChar, opts.indentSize);
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

        // preserve comments in selector (type === 'rule')
        if (raws.selector && raws.selector.raw) {
            rule.selector = rule.raws.selector.raw;
        }
        maxSelectorLength(rule, opts);

        // -> formatAtRule()   - common code w/ formatRule()
        if (type === 'atrule') {
            if (rule.params) {
                rule.raws.afterName = ' ';
            }
            maxAtRuleLength(rule, opts);
        }

        if (type === 'decl') {
            // ensure space following colon
            if (!commentRegex().test(rule.raws.between)) {
                rule.raws.between = ': ';
            }
            maxValueLength(rule, opts);
        }

        if (rule.parent && rule.parent.type !== 'root') {
            rule.raws.before = '\n' + blank(rule.raws.before);
            rule.raws.after = '\n' + indent;
        }

        // add newline before at-rules
        if (rule.parent && rule !== rule.parent.first && (type === 'rule' || type === 'atrule')) {
            if (type === 'atrule' && !rule.nodes) {
                rule.raws.before = '\n' + indent;
                return;
            }
            // two newlines before blocks
            rule.raws.before = '\n\n' + indent;
        }
    });
    css.raws.after = '\n';
}
