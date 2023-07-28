import { 
    copy, 
    PublicStructural, 
    Stateful, 
    StructState,
    StructStateApply, 
    StructStatePath, 
    StructStateUpdate
} from '@benzed/immutable'

import { Mutate, Mutator, Traits } from '@benzed/traits'

import { Infer, isFunc, omit, pick } from '@benzed/util'

import { Node, PublicNode } from '../traits'

import NodeTable from './node-table'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

type _K = string | number | symbol

type _NodeRecordPick<T extends NodeRecord, K extends (keyof T)[]> = 
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? Tk : never]: T[Tk]
    }, NodeRecord>

type _NodeRecordOmit<T extends NodeRecord, K extends (keyof T)[]> = 
    Infer<{
        [Tk in keyof T as Tk extends K[number] ? never : Tk]: T[Tk]
    }, NodeRecord>

type _NodeRecordMerge<T extends NodeRecord, Tx extends NodeRecord> = 
    Infer<{
        [K in keyof T | keyof Tx]: K extends keyof Tx 
            ? Tx[K]
            : K extends keyof T 
                ? T[K]
                : never
    }, NodeRecord>

type _NodeRecordSet<T extends NodeRecord, K extends _K, R extends Node> = 
    Infer<_NodeRecordMerge<T, { [Kk in K]: R }>, NodeRecord>

//// Types ////

type NodeRecord = {
    readonly [key: string]: Node
}

interface NodeTableBuilder<R extends NodeRecord> extends PublicNode {

    pick<K extends (keyof R)[]>(...keys: K): NodeTable<_NodeRecordPick<R, K>>

    omit<K extends (keyof R)[]>(...keys: K): NodeTable<_NodeRecordOmit<R, K>>

    merge<Tx extends NodeRecord>(record: Tx): NodeTable<_NodeRecordMerge<R, Tx>>

    create<K extends _K, Rv extends Node>(
        key: K, 
        record: Rv
    ): NodeTable<_NodeRecordSet<R, K, Rv>>

    create<P extends StructStatePath>(...pathAndApply: [...P, StructStateApply<NodeTable<R>, P>]): NodeTable<R>

    update<K extends keyof R, F extends (input: R[K]) => Node>(
        key: K, 
        update: F
    ): NodeTable<_NodeRecordSet<R, K, ReturnType<F>>>

    update<P extends StructStatePath>(...pathAndUpdate: [...P, StructStateUpdate<NodeTable<R>, P>]): NodeTable<R>

    get<P extends StructStatePath>(...path: P): StructState<NodeTable<R>, P>

    copy(): NodeTable<R> 

    equals(other: unknown): other is NodeTable<R>

}

//// Main ////

const NodeTableBuilder = (class extends Traits.add(Mutator<NodeTable<NodeRecord>>, PublicNode, PublicStructural) {

    get [Stateful.state]() {
        return this[Mutator.target][Stateful.state]
    }

    set [Stateful.state](state) {
        this[Mutate.target][Stateful.state] = state
    }

    constructor(table: NodeTable<NodeRecord>) {
        super(table)
        return Traits.apply(
            this,
            PublicNode,
            PublicStructural
        )
    }

    override [Mutate.get](builder: any, key: any, value: any): any {
        const result = super[Mutate.get](builder, key, value)

        // rebase any PublicNode or PublicStructural interface methods
        // that are on the builder onto to the target
        return isFunc(result)
            ? result.bind(builder[Mutate.target])
            : result
    }

    pick(...keys: PropertyKey[]): NodeTable<NodeRecord> {
        const record = copy(this[Stateful.state]) as any
        return new NodeTable(
            pick(record, ...keys) as NodeRecord
        )
    }

    omit(...keys: PropertyKey[]): NodeTable<NodeRecord> {
        const record = copy(this[Stateful.state]) as any
        return new NodeTable(
            omit(record, ...keys) as NodeRecord
        )
    }

    merge(newRecord: NodeRecord): NodeTable<NodeRecord> {
        const oldRecord = copy(this[Stateful.state]) as any
        return new NodeTable(
            {
                ...oldRecord,
                ...newRecord
            }
        )
    }

}) as unknown as new <R extends NodeRecord>(record: R) => NodeTableBuilder<R>

//// Exports ////

export default NodeTableBuilder

export {
    NodeTableBuilder
}