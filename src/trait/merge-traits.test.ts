import { Trait } from './trait'

import { mergeTraits } from './merge-traits'
import { useTraits } from './add-traits'
 
import { it, expect } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

it('should return a new trait that extends the traits', () => {
    const trait1 = class MyTrait1 extends Trait {
        static override is(input: unknown): input is MyTrait1 {
            return true
        }

        get prop1() {
            return 'value1' 
        }
        method1() {
            return 'method1'
        }
    }
    const trait2 = class MyTrait2 extends Trait {
        static override is(input: unknown): input is MyTrait2 {
            return true
        }

        get prop2() {
            return 'value2'
        }
        method2() {
            return 'method2'
        }
    }
    const mergedTrait = mergeTraits(trait1, trait2)

    expect(mergedTrait.prototype).toBeInstanceOf(trait1)
    expect(mergedTrait.prototype).toBeInstanceOf(trait2)
})

it('should add properties and methods from all traits to the new trait', () => {
    const trait1 = class MyTrait1 extends Trait {
        get prop1() {
            return 'value1' 
        }
        method1() {
            return 'method1' 
        }
    }
    const trait2 = class MyTrait2 extends Trait {
        get prop2() {
            return 'value2' 
        }
        method2() {
            return 'method2' 
        }
    }
    const MergedTraits = mergeTraits(trait1, trait2)

    const mergedInstance = new class extends useTraits(MergedTraits) {}
    expect(mergedInstance.prop1).toBe('value1')
    expect(mergedInstance.method1()).toBe('method1')
    expect(mergedInstance.prop2).toBe('value2')
    expect(mergedInstance.method2()).toBe('method2')
})

it('adds all static symbols', () => {

    class Sharp extends Trait {
        static readonly sharp = Symbol('sharp')
    }

    class Bold extends Trait {
        static readonly bold = Symbol('sharp')
    }

    const SharpBold = mergeTraits(Bold, Sharp)
    expect(SharpBold.sharp).toBe(Sharp.sharp)
    expect(SharpBold.bold).toBe(Bold.bold)
    expect(SharpBold.apply).not.toBe(Trait.apply)
})