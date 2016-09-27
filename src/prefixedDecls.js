import vendors from 'vendors';

const prefixes = vendors.map(vendor => `-${vendor}-`);

export default function prefixedDeclarations ({nodes}) {
    const prefix = node => prefixes.some(p => node.prop && !node.prop.indexOf(p));
    return nodes.filter(prefix);
}
