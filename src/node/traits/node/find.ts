import {
    AnyTypeGuard,
    Each,
    each,
    Func,
    isFunc,
    isShape,
    nil,
    pass,
    TypeGuard
} from '@benzed/util'
import { Comparable } from '@benzed/immutable'
import { Callable, Trait } from '@benzed/traits'

import { Node } from './node'
import { getPath } from './path'
import {
    eachAncestor,
    eachChild,
    eachDescendant,
    eachNode,
    eachParent,
    eachSibling
} from './relations'

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Helper Types////

type NodeTrait<N extends Node = Node> = {
    is(input: unknown): input is N
}

type NodeTypeGuard<N extends Node = Node> = TypeGuard<N, N>
type NodePredicate<N extends Node = Node> = (input: N) => boolean

//// Types ////

type FindInput<N extends Node = Node> = N | NodePredicate<N> | NodeTypeGuard<N> | NodeTrait<N>
type FindOutput<I extends FindInput<any>> =
    I extends NodePredicate<infer N> | NodeTypeGuard<infer N> | NodeTrait<infer N>
        ? N
        : I extends Node
            ? I
            : never

interface FindNode<N extends Node> {

    <I extends FindInput<N>>(input?: I): FindOutput<I> | nil
    get inChildren(): FindNode<N>
    get inSiblings(): FindNode<N>
    get inDescendants(): FindNode<N>
    get inParents(): FindNode<N>
    get inAncestors(): FindNode<N>
    get inNodes(): FindNode<N>
    get or(): FindNode<N>
    get all(): FindNodes<N>

}

interface FindNodes<N extends Node> {
    <I extends FindInput<N>>(input?: I): FindOutput<I>[]
    get inChildren(): FindNodes<N>
    get inSiblings(): FindNodes<N>
    get inDescendants(): FindNodes<N>
    get inParents(): FindNodes<N>
    get inAncestors(): FindNodes<N>
    get inNodes(): FindNodes<N>
    get or(): FindNodes<N>
}

interface HasNode<N extends Node> {
    <I extends FindInput<N>>(input: I): boolean
    get inChildren(): HasNode<N>
    get inSiblings(): HasNode<N>
    get inDescendants(): HasNode<N>
    get inParents(): HasNode<N>
    get inAncestors(): FindNodes<N>
    get inNodes(): FindNodes<N>
    get or(): FindNodes<N>
}

interface AssertNode<N extends Node> {
    <I extends FindInput<N>>(input: I, error?: string): FindOutput<I>
    get inChildren(): AssertNode<N>
    get inSiblings(): AssertNode<N>
    get inDescendants(): AssertNode<N>
    get inParents(): AssertNode<N>
    get inAncestors(): AssertNode<N>
    get inNodes(): AssertNode<N>
    get or(): AssertNode<N>
}

interface FindConstructor {
    new <N extends Node>(source: N): FindNode<N>
    new <N extends Node>(source: N, flag: FindFlag.All): FindNodes<N>
    new <N extends Node>(source: N, flag: FindFlag.Has): HasNode<N>
    new <N extends Node>(source: N, flag: FindFlag.Assert, error?: string): AssertNode<N>
}

enum FindFlag {
    Assert = 0,
    Has = 1,
    All = 2
}

//// Implementation ////

const Find = class NodeFinder extends Trait.use(Callable<Func>) {

    constructor(
        readonly source: Node,
        private _flag?: FindFlag,
        private readonly _error?: string
    ) {
        super()
        this._each = eachChild(source)
        return Callable.apply(this)
    }

    //// Interface ////

    get [Callable.signature]() {
        return this.find
    }

    get or(): this {
        this._mergeOnIncrement = true
        return this
    }

    get all(): this {
        this._flag = FindFlag.All
        return this
    }

    get inChildren(): this {
        return this._incrementEach(
            eachChild(this.source)
        )
    }

    get inSiblings(): this {
        return this._incrementEach(
            eachSibling(this.source)
        )
    }

    get inDescendants(): this {
        return this._incrementEach(eachDescendant(this.source))
    }

    get inParents(): this {
        return this._incrementEach(eachParent(this.source))
    }

    get inAncestors(): this {
        return this._incrementEach(eachAncestor(this.source))
    }

    get inNodes(): this {
        return this._incrementEach(eachNode(this.source))
    }

    //// Helper ////

    find(input?: FindInput, error?: string): unknown {
        const predicate = toNodePredicate(input)

        const found = new Set<Node>()
        const { _flag: flag } = this

        iterators: for (const node of this._each) {

            if (found.has(node))
                continue

            const pass = predicate(node)
            if (pass)
                found.add(Node.is(pass) ? pass : node)

            if (pass && flag !== FindFlag.All)
                break iterators
        }

        const has = found.size > 0
        if (flag === FindFlag.Assert && !has) {
            throw new Error(
                error ??
                this._error ??
                `Node ${getPath(this.source).join('/')} Could not find node ${toNodeName(input)}`
            )
        }

        if (flag === FindFlag.Has)
            return has

        if (flag === FindFlag.All) 
            return Array.from(found)

        const [first] = found
        return first
    }

    //// Iterators ////

    private _each: Each<Node>
    private _mergeOnIncrement = false
    private _incrementEach(...iterators: Iterable<Node>[]): this {

        this._each = this._mergeOnIncrement
            ? each(this._each, ...iterators)
            : each(...iterators)

        return this
    }

} as FindConstructor

//// Helper ////

// TODO should be exchanged with 'isGuardedConstructor'
const isNodeTrait: (input: unknown) => input is NodeTrait =
    isShape({
        is: isFunc as AnyTypeGuard
    })

function toNodePredicate(input?: FindInput): NodeTypeGuard | NodePredicate {

    if (!input)
        return pass

    if (isNodeTrait(input))
        return input.is

    if (Node.is(input)) {
        return Comparable.is(input)
            ? other => input[Comparable.equals](other)
            : other => Object.is(input, other)
    }

    if (isFunc(input))
        return input

    throw new Error('Invalid find input.')
}

function toNodeName(input?: FindInput): string {

    let name = input && 'name' in input
        ? input.name
        : ''

    // assume typeguard with convention isModuleName
    if (name.startsWith('is'))
        name = name.slice(0, 2)

    // assume anonymous typeguard
    if (!name)
        return Node.name

    return name
}

//// Exports ////

export default Find

export {

    Find,
    FindFlag,
    FindConstructor,
    FindInput,
    FindOutput,

    FindNode,
    FindNodes,
    HasNode,
    AssertNode,
}
