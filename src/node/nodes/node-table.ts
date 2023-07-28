import { copy, Copyable, Stateful, Structural } from '@benzed/immutable'
import { assign, Func, omit } from '@benzed/util'
import { Callable, Traits } from '@benzed/traits'

import { Node } from '../traits'

import { NodeTableBuilder } from './node-table-builder'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type NodeRecord = {
    readonly [key: string]: Node
}

interface NodeTableProperties<T extends NodeRecord> extends NodeTableMethod<T>, Node, Structural {
    [Stateful.state]: T
}

type NodeTable<T extends NodeRecord> =
     & T 
     & NodeTableProperties<T>

interface NodeTableConstructor {
    new <T extends NodeRecord>(record: T): NodeTable<T>
}

interface NodeTableMethod<T extends NodeRecord> {
    <F extends (builder: NodeTableBuilder<T>) => NodeTable<any>>(update: F): ReturnType<F>
}

//// Helper ////

function useNodeTableBuilder(this: NodeTable<NodeRecord>, update: Func) {
    const builder = new NodeTableBuilder(this)
    return update(builder)
}

//// Main ////

/**
 * NodeTable is an immutable structure with a call signature providing an interface
 * for static updates.
 */
const NodeTable = class NodeTable extends Traits.use(Callable, Structural, Node) {

    constructor(children: NodeRecord) {
        super()
        const table = Traits.apply(this, Callable, Structural, Node)
        table[Stateful.state] = children
        return table
    }

    get [Callable.signature]() {
        return useNodeTableBuilder
    }

    //// State ////

    override [Structural.copy](): this {
        let clone = Copyable.createFromProto(this)
        clone = Traits.apply(clone, Callable, Structural, Node)
        clone[Stateful.state] = copy(this[Stateful.state])
        return clone
    }

    get [Stateful.state](): NodeRecord {
        return { ...this } as unknown as NodeRecord
    }

    set [Stateful.state](record: NodeRecord) {
        assign(this, omit(record, Stateful.state))
    }

} as NodeTableConstructor

//// Exports ////

export default NodeTable

export {
    NodeTable
}