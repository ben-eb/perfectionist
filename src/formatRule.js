import formatBlock from './formatBlock';
import {maxSelectorLength} from './maxSelectorLength';
import setIndent from './setIndent';

export default function formatRule (rule, opts/* , css*/) {
    const {raws} = rule;

    formatBlock(rule, opts);

    // preserve comments in selector
    if (raws.selector && raws.selector.raw) {
        rule.selector = raws.selector.raw;
    }
    maxSelectorLength(rule, opts);

    const indent = setIndent(rule, opts);
    if (rule.parent && rule !== rule.parent.first) {
        raws.before = '\n\n' + indent;
    }
};
