import 'string.prototype.repeat';

export default function space (amount, indent = ' ') {
    return indent.repeat(amount);
}
