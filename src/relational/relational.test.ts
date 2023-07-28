import { nil } from '@benzed/types'

import { it, expect, describe } from '@jest/globals'

import { Relational } from './relational'
import { Trait } from '../trait'

//// Types ////

class Person extends Trait.use(Relational) {
    constructor() {
        super()
        return Relational.apply(this)
    }

    [key: string]: Person | nil

    get parent() {
        return Relational.getParent(this) as Person | nil
    }
}

//// Tests ////

describe('auto parent set', () => {
    it('on property define', () => {
        const parent = new Person()
        parent.child = new Person()
        expect(parent.child.parent).toBe(parent)
    })

    it('on property set', () => {
        const parent = new Person()
        const child1 = new Person()
        const child2 = new Person()

        parent.child = child1
        parent.child = child2
        expect(child2.parent).toBe(parent)
    })

    it('previous parents are cleared', () => {
        const parent = new Person()
        const child1 = new Person()
        const child2 = new Person()

        parent.child = child1
        parent.child = child2
        expect(child1.parent).toBe(nil)
    })
})

describe('auto parent clear', () => {
    it('on property delete', () => {
        const parent = new Person()
        const child = new Person()

        parent.child = child
        expect(child.parent).toBe(parent)

        delete parent.child
        expect(child.parent).toBe(nil)
    })
})
