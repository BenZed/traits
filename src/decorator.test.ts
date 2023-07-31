import { TypeGuard, isNumber, isShape, isString } from '@benzed/types'

import { trait } from './decorator'

import { test, expect } from '@jest/globals'

//// Tests ////

@trait
abstract class Size {
    //
    static readonly is: TypeGuard<Size> = isShape({
        size: isNumber
    })

    abstract get size(): number
}

test('decorated classes can not be constructed', () => {
    class Large extends Size {
        get size() {
            return 5
        }
    }

    expect(() => new Large()).toThrow('must not be constructed')
})

test('decorated classes override instanceof operator', () => {
    class Thing {
        size = 1
    }

    expect(new Thing() instanceof Size).toBe(true)
})

test('decorated classes must have is method', () => {
    expect(() => {
        // @ts-expect-error Must have 'is' type guard
        @trait
        class NotATrait {}
        void NotATrait
    }).toThrow('require a static type guard')
})

test('cannot decorate classes with params', () => {
    // @ts-expect-error No constructor params
    @trait
    class NotATrait {
        static readonly is = isShape({ foo: isString })

        constructor(readonly foo: string) {}
    }

    void NotATrait
})
