import postcss from 'postcss';
import {block as commentRegex} from 'comment-regex';
import blank from './blank';
import getIndent from './getIndent';
import longest from './longest';
import {maxAtRuleLength, maxSelectorLength, maxValueLength} from './maxSelectorLength';
import prefixedDecls from './prefixedDecls';
import space from './space';
import formatDeclaration from './formatDeclaration';
import formatComment from './formatComment';

const {unprefixed} = postcss.vendor;

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

        let indent = getIndent(rule, opts.indentChar, opts.indentSize);

        if (type === 'comment') {
            formatComment(rule, opts, css);
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
