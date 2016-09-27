import valueParser, {unit} from 'postcss-value-parser';

function isHex (node) {
    if (node.value[0] !== '#') {
        return false;
    }
    const range = node.value.slice(1);
    return ~[3, 4, 6, 8].indexOf(range.length) && !isNaN(parseInt(range, 16));
}

function toShorthand (hex) {
    if (
        hex.length === 7 &&
        hex[1] === hex[2] &&
        hex[3] === hex[4] &&
        hex[5] === hex[6]
    ) {
        return '#' + hex[2] + hex[4] + hex[6];
    }
    return hex;
}

function toLonghand (hex) {
    if (hex.length !== 4) {
        return hex;
    }

    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return '#' + r + r + g + g + b + b;
};

const lengths = [
    'px',
    'em',
    'rem',
    'ex',
    'ch',
    'vh',
    'vw',
    'cm',
    'mm',
    'in',
    'pt',
    'pc',
    'vmin',
    'vmax',
];

export default function applyTransformFeatures (decl, opts) {
    decl.value = valueParser(decl.value).walk(node => {
        if (node.type !== 'word') {
            return;
        }
        if (isHex(node)) {
            if (opts.colorCase === 'upper') {
                node.value = node.value.toUpperCase();
            }
            if (opts.colorCase === 'lower') {
                node.value = node.value.toLowerCase();
            }
            if (opts.colorShorthand === true) {
                node.value = toShorthand(node.value);
            }
            if (opts.colorShorthand === false) {
                node.value = toLonghand(node.value);
            }
        }
        const pair = unit(node.value);
        if (pair) {
            const number = Number(pair.number);
            if (
                opts.zeroLengthNoUnit === true &&
                ~lengths.indexOf(pair.unit.toLowerCase()) &&
                number === 0
            ) {
                node.value = '0';
            }

            if (opts.trimLeadingZero === true) {
                node.value = node.value.replace(/(\D|^)(0)(\.\d+)/g, '$1$3');
            } else {
                node.value = node.value.replace(/(\D|^)(\.\d+)/g, '$10$2');
            }

            if (opts.trimTrailingZeros === true) {
                node.value = node.value.replace(/(\d+)(\.[0-9]*[1-9]+)(0+)/g, '$1$2');
                node.value = node.value.replace(/(\d+)(\.0+)/g, '$1');
            }
        }
    }).toString();
}
