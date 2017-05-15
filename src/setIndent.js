import getIndent from './getIndent';
import blank from './blank';

export default function setIndent (rule, opts) {
    let indent = getIndent(rule, opts.indentChar, opts.indentSize);
    rule.raws.before = indent + blank(rule.raws.before);

    if (rule.parent && rule.parent.type !== 'root') {
        // newline before each declaration
        rule.raws.before = '\n' + blank(rule.raws.before);
        // set indentation before following closing brace (?)
        rule.raws.after = '\n' + indent;
    }

    return indent;
};
