export default function isSassVariable ({parent, prop}) {
    return parent.type === 'root' && prop.match(/^\$/);
}
