import { test, expect } from '@jest/globals'
import { isFunc, isNumber, isShape, isTuple } from '@benzed/types'

import { trait } from './decorator'

import { addTraits } from './add-traits'
import { mergeTraits } from './merge-traits'

//// Setup ////

@trait
class Sharp {
    static readonly is = isShape<Sharp>({
        sharp: isFunc
    })

    sharp() {
        return 'very sharp!'
    }
}

@trait
class Heavy {
    static readonly is = isShape<Heavy>({
        heavy: isFunc
    })

    heavy() {
        return 'so very heavy!'
    }
}

class Weapon extends mergeTraits(Sharp, Heavy) {
    static override is(input: unknown): input is Weapon {
        return super.is(input) && 'damage' in input && isFunc(input.damage)
    }

    damage() {
        return 'so much damage!'
    }
}

class Sword extends addTraits(class {}, Weapon) {}

//// Tests ////

test('result is a trait', () => {
    expect(Weapon.is).toEqual(expect.any(Function))
    expect(() => new Weapon()).toThrow(
        Weapon.name + ' is a trait and must not be constructed'
    )

    const sword = new Sword()

    expect(sword).toBeInstanceOf(Sword)
    expect(sword).toBeInstanceOf(Weapon)
    expect(sword).toBeInstanceOf(Heavy)
    expect(sword).toBeInstanceOf(Sharp)
})

test('preserves static symbols', () => {
    //

    @trait
    abstract class Shape {
        static readonly is = isShape({ sides: isNumber })

        static readonly type = Symbol('shape-type')

        abstract sides: number
    }

    @trait
    abstract class Color {
        static readonly is = isShape({
            rgb: isTuple(isNumber, isNumber, isNumber)
        })

        static readonly alpha = Symbol('color-alpha')

        abstract rgb: [number, number, number]
    }

    abstract class Toy extends mergeTraits(Shape, Color) {}

    expect(Toy.type).toBe(Shape.type)
    expect(Toy.alpha).toBe(Color.alpha)
})

test('bugfix: does not inherit static properties of first trait', () => {
    @trait
    abstract class Red {
        static readonly RED_CHANNEL_INDEX = 0

        static readonly is = isShape<Red>({
            r: isNumber
        })

        abstract get r(): number
    }

    @trait
    abstract class Blue {
        static readonly BLUE_CHANNEL_INDEX = 1

        static readonly is = isShape<Blue>({
            b: isNumber
        })

        abstract get b(): number
    }

    @trait
    abstract class Green {
        static readonly GREEN_CHANNEL_INDEX = 2

        static readonly is = isShape<Green>({
            b: isNumber
        })

        abstract get b(): number
    }

    abstract class Color extends mergeTraits(Red, Blue, Green) {}

    // @ts-expect-error Does not have property
    void Color.RED_CHANNEL_INDEX
    expect(Color).not.toHaveProperty('RED_CHANNEL_INDEX')
})
