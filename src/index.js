import postcss from 'postcss';
import applyExpanded from './applyExpanded';

const perfectionist = postcss.plugin('perfectionist', opts => {
    opts = {
        indentSize: 4,
        indentChar: ' ',
        maxAtRuleLength: 80,
        maxSelectorLength: 80,
        maxValueLength: 80,
        trimLeadingZero: true,
        trimTrailingZeros: true,
        colorCase: 'lower',
        colorShorthand: true,
        zeroLengthNoUnit: true,
        ...opts,
    };

    return css => {
        applyExpanded(css, opts);
    };
});

perfectionist.process = (css, opts = {}) => {
    opts.map = opts.map || (opts.sourcemap ? true : null);
    if (opts.syntax === 'scss') {
        opts.syntax = require('postcss-scss');
    }
    let processor = postcss([ perfectionist(opts) ]);
    return processor.process(css, opts);
};

export default perfectionist;
