import formatBlock from './formatBlock';
import {maxAtRuleLength} from './maxSelectorLength';
import setIndent from './setIndent';

export default function formatRule (rule, opts/* , css*/) {
    const {raws} = rule;

    if (rule.nodes) {
        formatBlock(rule, opts);
    } else {
        // strip space before semicolon
        raws.between = '';
    }
    raws.semicolon = true;

    if (rule.params) {
        raws.afterName = ' ';
    }
    maxAtRuleLength(rule, opts);

    const indent = setIndent(rule, opts);
    if (rule.parent && rule !== rule.parent.first) {
        if (!rule.nodes) {
            raws.before = '\n' + indent;
        } else {
            raws.before = '\n\n' + indent;
        }
    }
};
