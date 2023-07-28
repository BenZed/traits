import { Trait } from './trait'

import { it, test, expect, describe } from '@jest/globals'
import { isFunc, isNumber, isShape, isTuple } from '@benzed/util'

//// Test ////

class Huggable extends Trait {

    static override readonly is: (input: unknown) => input is Huggable = isShape({
        hug: isFunc
    })

    hug(): void {
        void this
    }

} 

class BrokenTrait extends Trait {}

abstract class Toy extends Trait {

    static override readonly is: (input: unknown) => input is Toy = isShape({
        price: isNumber
    })

    abstract get price(): number

}

abstract class Color extends Trait {

    static override readonly is: (input: unknown) => input is Color = isShape({
        color: isTuple(isNumber, isNumber, isNumber)
    })

    abstract get color(): [r: number, g: number, b: number]

}

class Black extends Color {
    get color(): [0,0,0] {
        return [0,0,0]
    }
}

//// Tests ////

const BlackHuggableToy = Trait.merge(Black, Huggable, Toy)

class TeddyBear extends Trait.use(BlackHuggableToy) {

    get price(): number {
        return 15
    }

} 

const teddyBear = new TeddyBear()

describe('instanceof uses type guards', () => {

    for (const trait of [Toy, Black, Huggable, Color]) {
        it(trait.name, () => {
            expect(teddyBear instanceof trait).toBe(true)
            expect(teddyBear).toBeInstanceOf(trait)
            expect(trait.is(teddyBear)).toBe(true)
        })
    }

    it('doesnt need to be an instance', () => {

        const huggable = {
            hug() {
                //
            }
        }

        expect(Huggable.is(huggable)).toBe(true)
        expect(huggable instanceof Huggable).toBe(true)

    })

})  

test('throws if static is has not been implemented', () => { 
    expect(() => BrokenTrait.is(teddyBear)).toThrow('BrokenTrait has not implemented a static typeguard named \'is\'')
})

test('classes created by calling traits.use have a composed typeguard', () => {
    expect(BlackHuggableToy.is(teddyBear)).toBe(true)

    const huggable: Huggable = {
        hug() {
            return 0
        } 
    }

    expect(BlackHuggableToy.is(huggable)).toBe(false)
})
