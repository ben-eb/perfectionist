import vendors from 'vendors';

const prefixes = vendors.map(vendor => `-${vendor}-`);

export default function prefixedDeclarations (rule) {
    const prefix = node => prefixes.some(p => node.prop && !node.prop.indexOf(p));
    return rule.nodes.filter(prefix);
}
