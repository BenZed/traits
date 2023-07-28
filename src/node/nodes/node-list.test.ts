import { copy, Copyable, Stateful, Structural } from '@benzed/immutable'
import { Traits } from '@benzed/traits'
import { assign, pick } from '@benzed/util'

import { NodeList } from './node-list'
import { Node, PublicNode } from '../traits'

import { test, it, expect, describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'  

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/ 

//// Setup ////

class Data<V> extends Traits.use(Node, Copyable) {

    constructor(
        readonly data: V 
    ) {
        super()
        return Node.apply(this)
    }

    get [Stateful.state](): Pick<this, 'data'> {
        return pick(this, 'data')
    }

    set [Stateful.state](state: Pick<this, 'data'>) {
        assign(this, pick(state, 'data'))
    }

    [Copyable.copy](): this {
        return new Data(this.data) as this
    }

}

//// Tests ////

const list = new NodeList(
    new Data(5), 
    new Data('ace')
)

test('new', () => {
    expect(list[0]).toEqual({ data: 5 })
    expect(list[1]).toEqual({ data: 'ace' })
})

test('length', () => {
    expect(list.length).toEqual(2)
})

test('index', () => {
    const zero = list[0]
    expectTypeOf(zero).toEqualTypeOf<Data<number>>()
})

test('at', () => {
    expect(list.at(0)).toEqual(list[0])

    // @ts-expect-error Invalid index
    expect(() => list.at(-1)).toThrow('is invalid')
})

describe('state', () => {

    it('get', () => {
        const state = Structural.get(list)
        expect(state).toEqual([{ data: 5 }, { data: 'ace' }])
    })

    it('set', () => {
        const state = Structural.get(list)

        const list2 = copy(list)

        Structural.set(list2, state)
       
        expect({ ...list2 }).toEqual({ ...list }) 
        expect(list2[0]).toBeInstanceOf(Data)
        expect(list2[1]).toBeInstanceOf(Data)

    })

})

describe('typesafe builder', () => { 

    it('add', () => {
        const list2 = list.add(new Data(true as const))
        expect(list2[Structural.state]).toEqual([new Data(5), new Data('ace'), new Data(true)])
        expectTypeOf(list2).toEqualTypeOf<NodeList<[Data<number>, Data<string>, Data<true>]>>()
    })

    it('get', () => {
        const state = list.get(0)
        expect(state).toEqual({ data: 5 })
        expectTypeOf(state).toEqualTypeOf<{ readonly data: number }>()
    })

    it('insert', () => {
        const list2 = list.insert(1, new Data(4 as const))
        expect(list2[Structural.state]).toEqual([new Data(5), new Data(4), new Data('ace')])
        expectTypeOf(list2).toEqualTypeOf<NodeList<[Data<number>, Data<4>, Data<string>]>>()
    })

    it('swap', () => {
        const list2 = list.swap(0, 1)
        expect(list2[Structural.state]).toEqual([new Data('ace'), new Data(5)])
        expectTypeOf(list2).toEqualTypeOf<NodeList<[Data<string>, Data<number>]>>()
    })  

    it('remove', () => {
        expect(list.remove(0)[Structural.state]).toEqual([new Data('ace')])
        expect(list.remove(1)[Structural.state]).toEqual([new Data(5)])
        expectTypeOf(list.remove(0)).toEqualTypeOf<NodeList<[Data<string>]>>()
    })

    it('create static', () => {
        const list2 = list.create(0, new Data(10 as const))
        expect(list2[Structural.state]).toEqual(
            [{ data: 10 }, { data: 'ace' }]
        )
        expectTypeOf(list2).toEqualTypeOf<NodeList<[Data<10>, Data<string>]>>()
    })

    it('create', () => {
        const list2 = list.create(0, 'data', 15)
        expect(list2[Structural.state]).toEqual(
            [{ data: 15 }, { data: 'ace' }]
        )
    })

    it('update static', () => {
        const list2 = list.update(0, d => new Data((d.data + 1) as 6))
        expect(list2[Structural.state])
            .toEqual([{ data: 6 }, { data: 'ace' }])
        expectTypeOf(list2).toEqualTypeOf<NodeList<[Data<6>, Data<string>]>>()
    })

    it('update', () => {
        const list2 = list.update(0, 'data', d => d + 10)
        expect(list2[Structural.state])
            .toEqual([{ data: 15 }, { data: 'ace' }])
    })

})

describe('relations', () => {

    it('parents', () => {
        expect(Node.getParent(list[0])).toBe(list)
    }) 

    it('survives copy', () => {
        const list2 = copy(list)

        expect(Node.getParent(list2[0]) === list).toBe(false)
        expect(Node.getParent(list2[0]) === list2).toBe(true)
    })

    it('has public node interface', () => {
        expect(PublicNode.is(list)).toBe(true)
    })

})