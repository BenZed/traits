import { trait } from './decorator'
import { isFunc, isNumber, isShapeOf } from '@benzed/types'
import { expect, test, describe } from '@jest/globals'

import { Traits } from './index'

//// Setup ////

@trait
abstract class Locatable {
    static readonly is = isShapeOf<Locatable>({
        x: isNumber,
        y: isNumber,
        move: isFunc
    })

    abstract x: number
    abstract y: number

    move(x: number, y: number) {
        this.x += x
        this.y += y
    }
}

@trait
abstract class Timer {
    static readonly is = isShapeOf<Timer>({
        time: isNumber,
        tick: isFunc
    })

    abstract time: number

    tick() {
        this.time--
    }
}

//// Tests ////

describe('create a class that consumes a trait', () => {
    class Balloon extends Traits(Locatable) {
        constructor(
            readonly x: number,
            readonly y: number
        ) {
            super()
        }
    }

    test('created class is constructable', () => {
        // in contrast to extending a trait directly, which would
        // throw an error.
        expect(() => new Balloon(0, 0)).not.toThrow()
    })

    test('created instance has interface methods', () => {
        const balloon = new Balloon(1, 1)

        balloon.move(1, 1)

        expect(balloon.x).toBe(2)
        expect(balloon.y).toBe(2)
    })

    test('respects type guards', () => {
        expect(new Balloon(0, 0) instanceof Locatable).toBe(true)
        expect(new Balloon(0, 0) instanceof Balloon).toBe(true)
    })
})

describe('create a class that consumes multiple traits', () => {
    class Bomb extends Traits(Locatable, Timer) {
        x = 5
        y = 5
        time = 10
    }

    test('created class is constructable', () => {
        // in contrast to extending a trait directly, which would
        // throw an error.
        expect(() => new Bomb()).not.toThrow()
    })

    test('created instance has interface methods', () => {
        const bomb = new Bomb()
        expect(bomb.x).toBe(5)
        expect(bomb.y).toBe(5)
        expect(bomb.time).toBe(10)

        bomb.move(5, 5)
        bomb.tick()

        expect(bomb.x).toBe(10)
        expect(bomb.y).toBe(10)
        expect(bomb.time).toBe(9)
    })

    test('respects type guards', () => {
        expect(new Bomb() instanceof Locatable).toBe(true)
        expect(new Bomb() instanceof Timer).toBe(true)
        expect(new Bomb() instanceof Bomb).toBe(true)
    })
})
