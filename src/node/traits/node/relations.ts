import { Each, each, GenericObject } from '@benzed/util'
import { Callable } from '@benzed/traits'

import { $$parent, getParent } from './parent'
import { Node } from './node'

//// Helper ////

type ChildKeys<T> = Exclude<keyof T, typeof $$parent>

/**
 * Any property of a given node that is also a node
 */
export type Children<T extends Node> = {
    [K in ChildKeys<T> as T[K] extends Node ? K : never]: T[K]
}

/**
 * Get the children of a node
 */
export function getChildren<T extends Node>(node: T): Children<T> {

    const children: GenericObject = {}

    for (const [key, descriptor] of each.defined.descriptorOf(node)) { 
        if (key !== $$parent && key !== Callable.context && Node.is(descriptor.value))
            children[key] = node[key]
    }

    return children as Children<T>
}

export function getRoot(node: Node): Node {
    return eachParent(node).toArray().at(-1) ?? node
}

//// Iterators ////

export function eachChild(node: Node): Each<Node> {
    const children = getChildren(node)
    return each.valueOf(children)
}

export function eachParent<T extends Node>(node: T): Each<Node> {
    return each(function * () {
        let parent = getParent(node)
        while (parent) {
            yield parent
            parent = getParent(parent)
        }
    })
}

export function eachSibling<T extends Node>(node: T): Each<Node> {
    return each(function * () {
        const parent = getParent(node)
        if (parent) {
            for (const child of eachChild(parent)) {
                if (child !== node)
                    yield child
            }
        }
    })
}

export function eachAncestor<T extends Node>(node: T): Each<Node> {
    return each(function * () {
        for (const parent of eachParent(node)) {
            yield parent
            yield* eachSibling(parent)
        }
    })
}

export function eachDescendant<T extends Node>(node: T): Each<Node> {

    return each(function * () {

        let current: Node[] = [node]
        const found = new Set<Node> 

        while (current.length > 0) {

            const next: Node[] = []
            for (const node of current) {

                // In case of circular references
                if (!found.has(node))
                    found.add(node) 
                else 
                    continue

                const children = eachChild(node).toArray()
                yield* children
                next.push(...children)
            }

            current = next
        }
    })
}

/**
 * From any node in the tree, iterate through every node in a given
 * node's tree.
 */
export function eachNode<T extends Node>(node: T): Each<Node> {
    return each(function * () {
        const root = getRoot(node)
        yield root
        yield* eachDescendant(root)
    })
}
