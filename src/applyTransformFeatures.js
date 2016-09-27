function toLowerCase (value) {
    return value.toLowerCase();
}

function toUpperCase (value) {
    return value.toUpperCase();
}

export default function applyTransformFeatures (decl, opts) {
    // hexadecimal color transformations
    const hexColorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const hasColor = decl.value.match(hexColorRegex) !== null;
    if (hasColor && opts.colorCase) {
        if (opts.colorCase === 'upper') {
            decl.value = decl.value.replace(hexColorRegex, toUpperCase);
        } else {
            decl.value = decl.value.replace(hexColorRegex, toLowerCase);
        }
    }
    if (hasColor && typeof opts.colorShorthand === 'boolean') {
        if (opts.colorShorthand === true) {
            decl.value = decl.value.replace(/#([A-Fa-f0-9])\1([A-Fa-f0-9])\2([A-Fa-f0-9])\3/i, '#$1$2$3');
        } else {
            decl.value = decl.value.replace(/^#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])$/i, '#$1$1$2$2$3$3');
        }
    }

    // zeros transformations
    if (opts.zeroLengthNoUnit && opts.zeroLengthNoUnit === true) {
        decl.value = decl.value.replace(/^0[\.0]*(?:px|r?em|ex|ch|vh|vw|cm|mm|in|pt|pc|vmin|vmax)/g, '0');
    }

    if (opts.trimLeadingZero === true) {
        decl.value = decl.value.replace(/(\D|^)(0)(\.\d+)/g, '$1$3');
    } else {
        decl.value = decl.value.replace(/(\D|^)(\.\d+)/g, '$10$2');
    }

    if (opts.trimTrailingZeros === true) {
        decl.value = decl.value.replace(/(\d+)(\.[0-9]*[1-9]+)(0+)/g, '$1$2');
        decl.value = decl.value.replace(/(\d+)(\.0+)/g, '$1');
    }
}
