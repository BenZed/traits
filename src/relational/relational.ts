import { nil, isDefined } from '@benzed/types'

import { $$parent, getParent, isRelational, setParent } from './parent'

import {
    eachAncestor,
    eachChild,
    eachDescendant,
    eachNode,
    eachParent,
    eachSibling,
    getChildren,
    getRoot
} from './relations'

import { getPath } from './path'

import {
    Find,
    AssertRelational,
    FindFlag,
    FindRelational,
    HasRelational
} from './find'

import { Trait } from '../trait'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Main ////

/**
 * The Relational trait creates knowledge of relations between objects,
 * allowing them to make assertions based on their relationship structure,
 * or existence of other nodes in their relationship tree.
 *
 * A relational will automatically assign itself as the parent of any
 * properties that are defined in it that are also nodes.
 */
abstract class Relational extends Trait {
    static readonly parent: typeof $$parent = $$parent

    static override readonly is = isRelational

    static readonly setParent = setParent

    static readonly getParent = getParent
    static readonly getChildren = getChildren
    static readonly getRoot = getRoot

    static readonly eachChild = eachChild
    static readonly eachParent = eachParent
    static readonly eachSibling = eachSibling
    static readonly eachAncestor = eachAncestor
    static readonly eachDescendent = eachDescendant
    static readonly eachNode = eachNode

    static readonly getPath = getPath

    static find<N extends Relational>(node: N): FindRelational<N> {
        return new Find(node)
    }

    static has<N extends Relational>(node: N): HasRelational<N> {
        return new Find(node, FindFlag.Has)
    }

    static assert<N extends Relational>(
        node: N,
        error?: string
    ): AssertRelational<N> {
        return new Find(node, FindFlag.Assert, error)
    }

    /**
     * Imbue a node with logic for assigning parents on property definition,
     * and unassign them on property deletion.
     */
    static override apply<T extends Relational>(node: T): T {
        const proxyNode = new Proxy(node, {
            defineProperty(node, key: keyof Relational, descriptor) {
                const { value } = descriptor

                const isParentKey = key === $$parent

                // clear parent of node being over-written
                if (
                    !isParentKey &&
                    isRelational(value) &&
                    isDefined(value[$$parent])
                ) {
                    throw new Error(
                        `Cannot set parent of property ${String(
                            key
                        )} without clearing value's existing parent`
                    )
                }

                // set parent of new node
                if (!isParentKey && isRelational(value))
                    setParent(value, proxyNode)

                return Reflect.defineProperty(node, key, descriptor)
            },

            deleteProperty(node, key: keyof Relational) {
                const isParentKey = key === $$parent
                if (!isParentKey && isRelational(node[key]))
                    setParent(node[key], nil)

                return Reflect.deleteProperty(node, key)
            }
        })

        for (const child of eachChild(proxyNode)) setParent(child, proxyNode)

        setParent(proxyNode, nil)
        return proxyNode
    }

    readonly [$$parent]: Relational | nil
}

//// Exports ////

export default Relational

export { Relational }
