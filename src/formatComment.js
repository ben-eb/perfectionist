import sameLine from './sameLine';
import blank from './blank';
import getIndent from './getIndent';

export default function formatComment (rule, opts, css) {
    let indent = getIndent(rule, opts.indentChar, opts.indentSize);
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
};
