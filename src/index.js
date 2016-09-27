import postcss from 'postcss';
import applyCompact from './applyCompact';
import applyCompressed from './applyCompressed';
import applyExpanded from './applyExpanded';

const perfectionist = postcss.plugin('perfectionist', opts => {
    opts = {
        format: 'expanded',
        indentSize: 4,
        maxAtRuleLength: 80,
        maxSelectorLength: 80,
        maxValueLength: 80,
        trimLeadingZero: true,
        trimTrailingZeros: true,
        cascade: true,
        colorCase: 'lower',
        colorShorthand: true,
        zeroLengthNoUnit: true,
        ...opts,
    };

    return css => {
        css.walk(node => {
            if (node.raws.before) {
                node.raws.before = node.raws.before.replace(/[;\s]/g, '');
            }
        });
        switch (opts.format) {
        case 'compact':
            applyCompact(css, opts);
            break;
        case 'compressed':
            applyCompressed(css, opts);
            break;
        case 'expanded':
        default:
            applyExpanded(css, opts);
            break;
        }
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
