import { copy } from '@benzed/immutable'
import { 
    Indexes, 
    IndexesOf, 
    swap
} from '@benzed/util'

import { Node } from '../traits'
/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types
*/

/**
 * A series of operations for making edits to a static array of modules
 */

//// Types ////

export type Nodes = readonly Node[]

//// Splice Nodes ////

type _SpliceNode<M extends Nodes, Mi extends IndexesOf<M>, Mx, I> = 
    I extends number  
        ? I extends Mi 
            ? Mx extends Nodes // insert
                ? [...Mx, M[I]] 
                : Mx extends Node /// overwrite
                    ? [Mx]
                    : [] //          // delete
            : [M[I]]
        : []

type _SpliceNodes<M extends Nodes, I extends IndexesOf<M>, T, _I extends readonly number[] = Indexes<M>> = 
    _I extends [infer _Ix, ...infer _Ir]
        ? _Ir extends readonly number[]
            ? [ ..._SpliceNode<M, I, T, _Ix>, ..._SpliceNodes<M, I, T, _Ir> ]
            : [ ..._SpliceNode<M, I, T, _Ix> ]
        : []

type SpliceNodes<
    M extends Nodes,
    I extends IndexesOf<M>,
    T, // NodeArray to add, Node to overwrite 1, unknown to delete 1
> = _SpliceNodes<M, I, T> extends infer Mx
    ? Mx extends Nodes
        ? Mx
        : []
    : []

function spliceNodes(input: Nodes, index: number, deleteCount: number, ...insert: Node[]): Nodes {
    const output = copy(input) as Node[]
    
    output.splice(index, deleteCount, ...insert)

    return output
}

//// AddNodes ////
    
export type AddNodes<
    A extends Nodes, 
    B extends Nodes
> = [
    ...A,
    ...B
] 

export function addNodes<
    A extends Nodes,
    B extends Nodes,
>(
    existing: A,
    ...additional: B
): AddNodes<A,B> {
    return [
        ...copy(existing),
        ...additional
    ]
}

//// InsertNodes ////

export type InsertNodes<
    M extends Nodes,
    I extends IndexesOf<M>,
    Mx extends Nodes
> = SpliceNodes<M, I, Mx>

export function insertNodes<
    M extends Nodes,
    I extends IndexesOf<M>,
    Mx extends Nodes 
>(
    input: M,
    index: I,
    ...modules: Mx
): InsertNodes<M, I, Mx> {
    return spliceNodes(
        input, 
        index, 0, 
        ...copy(modules)
    ) as InsertNodes<M,I,Mx>
}

//// SwapNodes ////

type _SwapNode<T extends Nodes, A extends number, B extends number, I> = I extends A 
    ? T[B]
    : I extends B 
        ? T[A]
        : I extends number 
            ? T[I]
            : never

type _SwapNodes<T extends Nodes, A extends number, B extends number, I extends readonly number[] = Indexes<T>> = 
    I extends [infer Ix, ...infer Ir]
        ? Ir extends readonly number[]
            ? [ _SwapNode<T, A, B, Ix>, ..._SwapNodes<T, A, B, Ir> ]
            : [ _SwapNode<T, A, B, Ix> ]
        : []

export type SwapNodes<
    M extends Nodes,
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
> = _SwapNodes<M,A,B> extends infer M 
    ? M extends Nodes
        ? M
        : []
    : []

export function swapNodes<
    M extends Nodes,
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
>(
    input: M,
    indexA: A,
    indexB: B
): SwapNodes<M,A,B> {

    const output = copy(input) as Nodes
    swap(output, indexA as number, indexB)

    return output as SwapNodes<M,A,B>
}

//// RemoveNode ////

export type RemoveNode<
    M extends Nodes,
    I extends IndexesOf<M>
> = SpliceNodes<M, I, unknown>

export function removeNode<
    M extends Nodes,
    I extends IndexesOf<M>
>(
    input: M,
    index: I
): RemoveNode<M, I> {
    return spliceNodes(input, index, 1) as RemoveNode<M, I>
}

//// ApplyNode ////

export type ApplyNode<M extends Nodes, I extends IndexesOf<M>, Mx>   
    = SpliceNodes<M, I, Mx>

export function applyNode<
    M extends Nodes,
    I extends IndexesOf<M>,
    Mx extends Node,
>(
    input: M,
    index: I,
    module: Mx
): ApplyNode<M, I, Mx> 

export function applyNode(input: Nodes, index: number, newNode: Node): Nodes {
    return spliceNodes(input, index, 1, newNode) 
}

//// Update Node ////

export type UpdateNode<
    N extends Nodes,
    I extends IndexesOf<N>, 
    U extends (input: N[I]) => Node

> = SpliceNodes<N, I, ReturnType<U>>

export function updateNode<
    M extends Nodes,
    I extends IndexesOf<M>,
    U extends (input: M[I]) => Node
>(input: M, index: I, update: U): UpdateNode<M, I, U>

export function updateNode(
    input: Nodes, 
    index: number, 
    update: ((current: Node) => Node)
): Nodes {
    return spliceNodes(input, index, 1, update(input[index])) 
}
