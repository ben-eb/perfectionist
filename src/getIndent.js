'use strict';

import space from './space';

export default function getIndent (node, base = 4) {
    let level = 0;
    let parent = node.parent;
    while (parent && parent.type !== 'root') {
        level++;
        parent = parent.parent;
    }
    return space(level * base);
}
