import { each } from '@benzed/util'

import type { Node } from './node'

import { eachParent, getChildren } from './relations'

//// Types ////

export type NodePath = PropertyKey[]

//// Main ////

export function getPath(node: Node, from?: Node): NodePath {

    const path: NodePath = []

    let foundFrom = false
    for (const parent of eachParent(node)) {

        const children = getChildren(parent) as Record<PropertyKey, Node>
        for (const [ name, child ] of each.entryOf(children)) {
            if (child === node) {
                path.push(name)
                node = parent
                break
            }
        }

        if (from && parent === from) {
            foundFrom = true
            break
        }

    }

    if (from && !foundFrom) {
        throw new Error(
            'Given reference node is not a parent of the input module.'
        )
    }

    return path.reverse()
}
