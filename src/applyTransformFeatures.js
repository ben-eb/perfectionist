function toLowerCase (value) {
    return value.toLowerCase();
}

function toUpperCase (value) {
    return value.toUpperCase();
}

export default function applyTransformFeatures (rule, opts) {
    if (rule.type !== 'decl') {
        return;
    }

    // hexadecimal color transformations
    const hexColorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const hasColor = rule.value.match(hexColorRegex) !== null;
    if (hasColor && opts.colorCase) {
        if (opts.colorCase === 'lower') {
            rule.value = rule.value.replace(hexColorRegex, toLowerCase);
        } else if (opts.colorCase === 'upper') {
            rule.value = rule.value.replace(hexColorRegex, toUpperCase);
        }
    }
    if (hasColor && opts.colorShorthand) {
        if (opts.colorShorthand === true) {
            rule.value = rule.value.replace(/#([A-Fa-f0-9])\1([A-Fa-f0-9])\2([A-Fa-f0-9])\3/i, '#$1$2$3');
        } else if (opts.colorShorthand === false) {
            rule.value = rule.value.replace(/^#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])$/i, '#$1$1$2$2$3$3');
        }
    }

    // zeros transformations
    if (opts.zeroLengthNoUnit && opts.zeroLengthNoUnit === true) {
        rule.value = rule.value.replace(/^0[\.0]*(?:px|r?em|ex|ch|vh|vw|cm|mm|in|pt|pc|vmin|vmax)/g, '0');
    }
    if (opts.trimLeadingZero === true) {
        rule.value = rule.value.replace(/(\D|^)(0)(\.\d+)/g, '$1$3');
    } else if (opts.trimLeadingZero === false) {
        rule.value = rule.value.replace(/(\D|^)(\.\d+)/g, '$10$2');
    }
    if (opts.trimTrailingZeros === true) {
        rule.value = rule.value.replace(/(\d+)(\.[0-9]*[1-9]+)(0+)/g, '$1$2');
        rule.value = rule.value.replace(/(\d+)(\.0+)/g, '$1');
    }
}
