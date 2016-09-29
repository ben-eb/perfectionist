export default function walk (parent, callback) {
    parent.nodes.forEach((node, index) => {
        const bubble = callback(node, index, parent);
        if (node.nodes && bubble !== false) {
            walk(node, callback);
        }
    });
}
