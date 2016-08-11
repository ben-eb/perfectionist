export default function deeplyNested ({nodes}) {
    return nodes && nodes.some(({nodes: children}) => children);
}
