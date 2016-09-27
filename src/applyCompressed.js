import {block as commentRegex} from 'comment-regex';
import applyTransformFeatures from './applyTransformFeatures';
import isSassVariable from './isSassVariable';

export default function applyCompressed (css, opts) {
    css.walk(rule => {
        rule.raws.semicolon = false;
        if (rule.type === 'comment' && rule.raws.inline) {
            rule.raws.inline = null;
        }
        if (rule.type === 'rule' || rule.type === 'atrule') {
            rule.raws.between = rule.raws.after = '';
        }
        if (rule.type === 'decl' && !commentRegex().test(rule.raws.between)) {
            rule.raws.between = ':';
        }
        if (rule.type === 'decl') {
            if (rule.raws.value) {
                rule.value = rule.raws.value.raw.trim();
            }
            // Format sass variable `$size: 30em;`
            if (isSassVariable(rule)) {
                rule.raws.before = '';
                rule.raws.between = ':';
                rule.value = rule.value.trim().replace(/\s+/g, ' ');
            }

            // Remove spaces before commas and keep only one space after.
            rule.value = rule.value.replace(/(\s+)?,(\s)*/g, ',');
            rule.value = rule.value.replace(/\(\s*/g, '(');
            rule.value = rule.value.replace(/\s*\)/g, ')');

            // Format `!important`
            if (rule.important) {
                rule.raws.important = '!important';
            }

            // Format `!default`, `!global` and more similar values.
            if (rule.value.match(/\s*!\s*(\w+)\s*$/i) !== null) {
                rule.value = rule.value.replace(/\s*!\s*(\w+)\s*$/i, '!$1');
            }

            if (rule.raws.value) {
                rule.raws.value.raw = rule.value;
            }

            applyTransformFeatures(rule, opts);
        }
    });
    // Remove final newline
    css.raws.after = '';
}
