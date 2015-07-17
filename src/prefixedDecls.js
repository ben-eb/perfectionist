'use strict';

let prefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];

export default function prefixedDeclarations (rule) {
    let prefix = node => prefixes.some(p => node.prop && !node.prop.indexOf(p));
    return rule.nodes.filter(prefix);
}
