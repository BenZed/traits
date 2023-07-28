
import { test, it, expect, describe } from '@jest/globals'
import { Falsy, Func, toVoid } from '@benzed/util'

import { expectTypeOf } from 'expect-type'
import { Method } from './method'
import { Callable } from './callable'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Callable Trait ////

class Multiply extends Method<(i: number) => number> {

    constructor(public by: number) {
        super(i => this.by * i)
    }

}

//// Exports ////

it('is abstract', () => {
    // @ts-expect-error Abstract
    expect(() => void new Callable()).toThrow(Error)
})

test('creates instances with call signatures', () => {

    const x2 = new Multiply(2) 

    expect(x2.constructor).toBe(Multiply)
    expect(x2(1)).toBe(2)
    expect(x2 instanceof Multiply).toBe(true)
})

it('keeps getters, setters and instance instance methods', () => {

    abstract class ValueCallable<T> extends Method<() => T> {
        
        abstract get value(): T 
        abstract set value(value: T)

        getValue(): T {
            return this.value
        }

        setValue(value: T): void {
            this.value = value
        }

        constructor() {
            super(() => this.value)
        }
 
    } 

    class Number extends ValueCallable<number> {
        constructor(public value = 0) {
            super()
        } 
    } 

    const value = new Number(5) 

    expect(value).toHaveProperty('value', 5)
    expect(value).toHaveProperty('getValue')
    expect(value).toHaveProperty('setValue')

    expect(value.value).toEqual(5)
    expect(value.getValue()).toEqual(5)

    expect(value()).toEqual(5)

    value.setValue(10)
    expect(value.value).toEqual(10)
    expect(value.getValue()).toEqual(10)
    expect(value()).toEqual(10)

    value.value = 15
    expect(value.value).toEqual(15)
    expect(value.getValue()).toEqual(15)
    expect(value()).toEqual(15)   

    class ArrayValue extends ValueCallable<number[]> {

        unwrap(): number {
            return this.value[0]
        }

        constructor(public value: number[]) {
            super()
        }

    }

    const arrayValue = new ArrayValue([5])
    expect(arrayValue.getValue()).toEqual([5])
    expect(arrayValue.unwrap()).toEqual(5)
}) 

it('gets symbolic properties', () => {  
 
    const $$true = Symbol('unique')
    class Symbolic extends Method<() => void> { 
 
        protected [$$true] = true

        constructor() {
            super(toVoid)
        }

        *[Symbol.iterator](): IterableIterator<symbol> {
            yield $$true
        } 

    } 

    const symbolic = new Symbolic() 
    expect([...symbolic]).toEqual([$$true])

})

it('instanceof', () => {

    class Foo extends Method<Func> {

    }

    const foo = new Foo(parseInt) 
    expect(foo).toBeInstanceOf(Foo)
    expect(foo).toBeInstanceOf(Function)

    class Bar extends Foo {}
    const bar = new Bar(parseFloat)
    expect(bar).toBeInstanceOf(Bar)
    expect(bar).toBeInstanceOf(Foo)
    expect(bar).toBeInstanceOf(Function)

    expect({} instanceof Bar).toBe(false)
    expect(function() { /**/ } instanceof Bar).toBe(false)
    expect((null as unknown) instanceof Bar).toBe(false)
    expect((NaN as unknown) instanceof Bar).toBe(false)
    expect({} instanceof Bar).toBe(false)

})

it('multiple signatures', () => {
    interface Convert<T extends number> {
        (): T
        (to: 'string'): `${T}`
        (to: 'boolean'): T extends Falsy ? false : true
    }

    abstract class Converter<T extends number> extends Method<Convert<T>> {

        constructor() {
            super(function (this: any, to?: string) {
                
                if (to === 'string')
                    return `${this.value}`

                if (to === 'boolean')
                    return !!this.value

                return this.value
            })
        }

        abstract get value(): T
    }

    class ConvertFive extends Converter<5> {
        readonly value = 5
    }

    const converter = new ConvertFive()

    expect(converter()).toEqual(5)
    expectTypeOf(converter()).toEqualTypeOf<5>()

    expect(converter('string')).toEqual('5')
    expectTypeOf(converter('string')).toEqualTypeOf<`${5}`>()
    expectTypeOf(converter('string')).toEqualTypeOf<'5'>()

    expect(converter('boolean')).toEqual(true)
    expectTypeOf(converter('boolean')).toEqualTypeOf<true>()
})

describe('this context', () => {

    it('function definition can use this', () => {

        interface ReturnsSelfKeyValue {
            <K extends keyof this>(key: K): this[K]
        }

        class Foo extends Method<ReturnsSelfKeyValue> {

            bar = 'bar' as const
            zero = 0 as const

            constructor() {
                super(function (this: any, k: PropertyKey) {
                    return this[k]
                })
            }

        }

        const foo = new Foo() 

        expect(foo('bar')).toEqual('bar')
        expectTypeOf(foo('bar')).toEqualTypeOf<'bar'>()
        expect(foo('zero')).toEqual(0)
        expectTypeOf(foo('zero')).toEqualTypeOf<0>()
    })

    it('can return this', () => { 

        interface ReturnsSelf {
            (): this
        }

        class Chain extends Method<ReturnsSelf> { 
            constructor() {
                super(function (this: any) {
                    return this
                })
            }
        }

        const chain = new Chain()

        expect(chain()).toEqual(chain)
        expect(chain()).toBeInstanceOf(Chain)
        expectTypeOf(chain()).toEqualTypeOf<Chain>()

        class ExtendedChain extends Chain {}

        const eChain = new ExtendedChain()

        expect(eChain()).toEqual(eChain)
        expect(eChain()).toBeInstanceOf(ExtendedChain)
        expectTypeOf(eChain()).toMatchTypeOf<ExtendedChain>()
    })

    it('can be bound', () => {

        class Shout extends Method<() => string> {

            constructor(protected readonly _words: string) {
                super(function (this: any) {
                    const ctx = (this[Callable.context] ?? this) as { _words: string }
                    return `${ctx?._words}!`
                })
            }

        }

        const shout = new Shout('hello')

        expect(shout()).toEqual('hello!')
        expect(shout.call({ _words: 'sup'})).toEqual('sup!')
        expect(shout.call({ _words: ''})).toEqual('!')
        expect(shout.call(undefined)).toEqual('hello!')

    })

})

it('retreive signature', () => {

    class Voider extends Method<() => void> {

        constructor() {
            super(toVoid)
        }
    }

    const voider = new Voider()
    expect(voider[Callable.signature]).toEqual(toVoid)
})

it('retreive context', () => {

    class Voider extends Method<() => void> {

        constructor() {
            super(function (this: any) {
                return this[Callable.context]
            })
        }
    }

    const voider = new Voider()

    const ace = {
        thing: 'sup',
        voider
    }

    expect(ace.voider()).toBe(ace)
})
