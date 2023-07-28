
import { NodeTable } from './node-table'
import { it, expect, test, describe } from '@jest/globals'

import { copy, PublicStruct, Structural } from '@benzed/immutable'
import { Trait } from '@benzed/traits'

import { Node, PublicNode } from '../traits'

import { expectTypeOf } from 'expect-type'

//// Setup ////

class Text<S extends string> extends Trait.use(Node) {
    constructor(readonly text: S) {
        super()
        return Node.apply(this)
    }
}

class Switch<B extends boolean> extends Trait.use(Node) {
    constructor(readonly boolean: B) {
        super()
        return Trait.apply(this, Node)
    }
}

//// Tests ////

const completed = new Switch(true)
const description = new Text('Finish NodeTable implementation')

const todo = new NodeTable({
    completed,
    description
}) 

it('construct', () => {
    expect(todo[Structural.state]).toEqual({
        completed,
        description
    })
})

it('key', () => {
    expect(todo.completed).toEqual(completed)
    expect(todo.description).toEqual(description)
})

describe('builder', () => {
 
    test('pick', () => {

        const todo2 = todo(t => t.pick('completed'))
        expect({ ...todo2 }).toEqual({ completed: todo.completed })

        expectTypeOf(todo2).toEqualTypeOf<NodeTable<{
            completed: Switch<true>
        }>>()
    })

    test('omit', () => { 
        const todo2 = todo(t => t.omit('completed'))
        expect({ ...todo2 }).toEqual({ description: todo.description })
        expectTypeOf(todo2).toEqualTypeOf<NodeTable<{
            description: Text<'Finish NodeTable implementation'>
        }>>()
    })

    test('merge', () => { 
        const off = new Switch(false) 
        const todo2 = todo(t => t.merge({ off }))
        expect({ ...todo2 }).toEqual({ ...todo, off })
        expectTypeOf(todo2).toEqualTypeOf<NodeTable<{
            completed: Switch<true>
            description: Text<'Finish NodeTable implementation'>
            off: Switch<false>
        }>>()
    }) 

    test('create static', () => { 

        const todo2 = todo(t => t.create('new', new Switch(false)))

        expectTypeOf(todo2).toEqualTypeOf<NodeTable<{
            completed: Switch<true>
            description: Text<'Finish NodeTable implementation'>
            new: Switch<false>
        }>>() 
    })

    test('create', () => { 

        class Location extends Trait.add(PublicStruct, Node) {
            readonly city: string = 'town'
            readonly street: string = 'main'

            constructor() {
                super()
                return Node.apply(this)
            }
        }

        const table1 = new NodeTable({ place: new Location() })

        const table2 = table1(table => table.create('place', 'city', 'vancouver'))

        expect(table2(t => t.get())).toEqual({
            place: { city: 'vancouver', street: 'main' }
        }) 

        expectTypeOf(table2).toEqualTypeOf<NodeTable<{
            place: Location
        }>>()
    })

    test('update static', () => {

        const todo1 = todo(t => t.create('completed', new Switch(false as boolean)))

        const todo2 = todo1(t => t.update('completed', s => new Switch(!s.boolean)))
        
        expect(Structural.get(todo2)).toEqual({
            completed: { boolean: true },
            description: { text: 'Finish NodeTable implementation' }
        })
        expectTypeOf(todo2).toEqualTypeOf<NodeTable<{
            completed: Switch<boolean>
            description: Text<'Finish NodeTable implementation'>
        }>>()
    })

    test('copy', () => {
        const todo2 = copy(todo)
        expect(todo2).not.toBe(todo)    
        expect({...todo2}).toEqual({...todo})
    })

})

describe('relations', () => {

    it('parents', () => {
        expect(Node.getParent(todo.completed) === todo).toBe(true)
    })

    it('survives copy', () => {
        const todo2 = copy(todo)
        expect(Node.getParent(todo2.completed) === todo).toBe(false)
        expect(Node.getParent(todo2.completed) === todo2).toBe(true)
    })

    it('has public node interface', () => {
        expect(() => todo(t => {
            if (!PublicNode.is(t)) 
                throw new Error('Node interface is not a public node')
            return t
        })).not.toThrow()
    })

})