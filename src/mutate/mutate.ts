import { isShape, isObject, AnyTypeGuard } from '@benzed/util'
import { unique } from '@benzed/array'

import { Trait } from '../trait'

//// Symbols ////

const $$target = Symbol('mutator-target')

const $$get = Symbol('mutator-get')
const $$set = Symbol('mutator-set')
const $$has = Symbol('mutator-has')
const $$ownKeys = Symbol('mutator-ownKeys')
const $$getPrototypeOf = Symbol('mutator-get-prototype-of')
const $$setPrototypeOf = Symbol('mutator-set-prototype-of')
const $$getOwnPropertyDescriptor = Symbol('mutator-get-own-property-descriptor')
const $$defineProperty = Symbol('mutator-defined-property')
const $$deleteProperty = Symbol('mutator-delete-property')

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/explicit-function-return-type,
    @typescript-eslint/no-explicit-any
*/
//// Main ////

abstract class Mutate<T extends object> extends Trait {

    static readonly target: typeof $$target = $$target
    static readonly get: typeof $$get = $$get
    static readonly set: typeof $$set = $$set
    static readonly has: typeof $$has = $$has
    static readonly ownKeys: typeof $$ownKeys = $$ownKeys
    static readonly getPrototypeOf: typeof $$getPrototypeOf = $$getPrototypeOf
    static readonly setPrototypeOf: typeof $$setPrototypeOf = $$setPrototypeOf
    static readonly defineProperty: typeof $$defineProperty = $$defineProperty
    static readonly deleteProperty: typeof $$deleteProperty = $$deleteProperty
    static readonly getOwnPropertyDescriptor: typeof $$getOwnPropertyDescriptor = $$getOwnPropertyDescriptor

    /**
     * Imbue a mutator with proxy traps that relegate operations to the mutate target, unless
     * the mutator defines overrides. 
     */
    static override apply<T extends Mutate<object>>(mutator: T): T {
        return new Proxy(mutator, {
            get: mutator[$$get],
            set: mutator[$$set],
            has: mutator[$$has],
            ownKeys: mutator[$$ownKeys],
            getPrototypeOf: mutator[$$getPrototypeOf],
            setPrototypeOf: mutator[$$setPrototypeOf],
            defineProperty: mutator[$$defineProperty],
            deleteProperty: mutator[$$deleteProperty],
            getOwnPropertyDescriptor: mutator[$$getOwnPropertyDescriptor]
        }) as T
    }

    static override readonly is: <Tx extends object>(input: unknown) => input is Mutate<Tx> = isShape({
        [$$target]: isObject
    }) as AnyTypeGuard

    //// Target ////

    abstract get [$$target](): T

    protected [$$get](mutator: Mutate<T>, key: keyof T, proxy: this) {

        const target = key === $$target || Reflect.has(mutator, key)
            ? mutator
            : mutator[$$target]

        return Reflect.get(target, key, proxy)
    }

    protected [$$set](mutator: Mutate<T>, key: keyof T, value: T[keyof T], receiver: unknown) {

        const target = key === $$target || Reflect.has(mutator, key)
            ? mutator
            : mutator[$$target]

        return Reflect.set(target, key, value, receiver)
    }

    protected [$$has](mutator: Mutate<T>, key: keyof T) {
        return (
            Reflect.has(mutator, key) ||
            Reflect.has(mutator[$$target], key)
        )
    }

    protected [$$getPrototypeOf](mutator: Mutate<T>) {
        return Reflect.getPrototypeOf(mutator[$$target])
    } 

    protected [$$setPrototypeOf](mutator: Mutate<T>, proto: object) {
        return Reflect.setPrototypeOf(mutator[$$target], proto)
    }

    protected [$$ownKeys](mutator: Mutate<T>) {
        return [
            ...Reflect.ownKeys(mutator),
            ...Reflect.ownKeys(mutator[$$target]),
        ].filter(unique)
    } 

    protected [$$defineProperty](
        mutator: Mutate<T>, 
        key: PropertyKey, 
        attributes: PropertyDescriptor
    ) {

        const target = key === $$target || Reflect.has(mutator, key)
            ? mutator
            : mutator[$$target]

        return Reflect.defineProperty(target, key, attributes)
    }

    protected [$$deleteProperty](mutator: Mutate<T>, key: keyof T) {
        return Reflect.deleteProperty(mutator[$$target], key)
    }

    protected [$$getOwnPropertyDescriptor](mutator: Mutate<T>, key: PropertyKey) {
        return (
            Reflect.getOwnPropertyDescriptor(mutator, key) ?? 
            Reflect.getOwnPropertyDescriptor(mutator[$$target], key)
        )
    }

}

//// Exports ////

export default Mutate

export {
    Mutate
}