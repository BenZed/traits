import { getPath } from './path'
import { Node } from './node'

import { test, expect, describe } from '@jest/globals'
import { Trait } from '@benzed/traits'

//// Setup ////
 
class Person extends Trait.use(Node) {

    constructor() {
        super()
        return Node.apply(this)
    }

    get name() {
        return this.constructor.name
    }
}

const grandPa = new class GrandPa extends Person {

    readonly mom = new class Mom extends Person {

        readonly you = new class You extends Person {
            readonly son = new class Son extends Person {
                readonly grandDaughter = new class GrandDaughter extends Person {
                    readonly greatGrandSon = new class GreatGrandSon extends Person {}
                }
            }
        }

        readonly sister = new class Sister extends Person {
            readonly cousin = new class Cousin extends Person {
                readonly neice = new class Niece extends Person {}
            }
        }
    }

    readonly uncle = new class Uncle extends Person {}
}

//// Tests ////

describe('getPath', () => {

    test('root node', () => {
        const path = getPath(grandPa)
        expect(path).toEqual([])
    })
  
    test('child node', () => {
        const path = getPath(grandPa.mom)
        expect(path).toEqual(['mom'])
    })
  
    test('grandchild node', () => {
        const path = getPath(grandPa.mom.you.son)
        expect(path).toEqual(['mom', 'you', 'son'])
    }) 
  
    test('nonexistent child node', () => {
        const nonexistent = new Person()
        expect(getPath(nonexistent)).toEqual([])
    })

    test('returns path from greatGrandSon to mom', () => {
        const result = getPath(grandPa.mom.you.son.grandDaughter.greatGrandSon, grandPa.mom)
        expect(result).toEqual(['you', 'son', 'grandDaughter', 'greatGrandSon'])
    })
  
    test('child node with nonexistent from', () => {
        const nonexistent = new Person()
        expect(() => getPath(grandPa.mom, nonexistent)).toThrowError()
    })
  
    test('child node with non-parent from', () => {
        const nonParent = new Person()
        expect(() => getPath(grandPa.mom, nonParent)).toThrowError()
    })
  
})
  