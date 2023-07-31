import { it, expect, describe, beforeAll } from '@jest/globals'

import { TypeGuard, isFunc, isShape } from '@benzed/types'

import { addTraits } from './add-traits'
import { trait } from './decorator'

//// Setup ////

describe('creates composite classes', () => {
    @trait
    abstract class Jumpable {
        static readonly is: TypeGuard<Jumpable> = isShape({
            jump: isFunc
        })

        abstract jump(): boolean
    }

    @trait
    abstract class DuckAble {
        static readonly is: TypeGuard<DuckAble> = isShape({
            duck: isFunc
        })

        abstract duck(): boolean
    }

    class Coordinates {
        constructor(
            public x: number,
            public y: number
        ) {}
    }

    class Sprite extends addTraits(Coordinates, Jumpable, DuckAble) {
        jump(): boolean {
            return false
        }
        duck(): boolean {
            return true
        }
    }

    let sprite: Sprite
    beforeAll(() => {
        sprite = new Sprite(0, 5)
    })

    it('extends Coordinates', () => {
        expect(sprite.x).toBe(0)
        expect(sprite.y).toBe(5)
        expect(sprite).toBeInstanceOf(Coordinates)
    })

    it('extends sprite', () => {
        expect(sprite).toBeInstanceOf(Sprite)
    })

    it('extends traits', () => {
        expect(sprite).toBeInstanceOf(Jumpable)
        expect(sprite).toBeInstanceOf(DuckAble)
    })

    it('bad trait type error', () => {
        class NotATrait<T> {
            constructor(readonly state: T) {}
        }

        // @ts-expect-error NotATrait invalid constructor signature
        void class Bad extends addTraits(Coordinates, NotATrait) {}
    })
})
