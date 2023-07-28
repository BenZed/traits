import {
    define,
    Func,
    isFunc,
    isIntersection,
    isShape,
    isObject,
    each, 
    AnyTypeGuard
} from '@benzed/util'

import { Trait } from '../trait'

//// Symbols ////

const $$signature = Symbol('callable-signature')

export const $$context = Symbol('callable-context')

//// Helper ////

/**
 * Instanceof operator that works with callable instances
 */
function isInstanceOfCallable(this: Func, instance: unknown): boolean {

    if (!isObject(instance) || !isFunc(instance?.constructor))
        return false 

    if (Object.is(instance.constructor, this))
        return true

    if (each.prototypeOf(instance.constructor).toArray().includes(this))
        return true 

    return false
}

//// Main ////

type Callable<F extends Func> = Trait & F & {

    readonly [$$context]: unknown

    get [$$signature](): F

    get name(): string

}

interface CallableStaticProperties {

    /**
     * Symbolic key to implement a getter in extended classes
     * that returns a function to be used as the call signature.
     */
    readonly signature: typeof $$signature

    /**
     * The outer 'this' of the calling signature
     */
    readonly context: typeof $$context

    /**
     * using the Callable trait changes the 'instanceOf' operator of it's consuming class
     * allowing it to correctly work on callable instances.
     */
    [Trait.onUse](constructor: object): void

    apply<F extends Func>(instance: F): F
    
    is<F extends Func>(input: unknown): input is Callable<F>
}

type CallableConstructor = (abstract new <F extends Func>() => Callable<F>) & CallableStaticProperties

//// Callable ////

const Callable = class extends Trait {

    static readonly signature: typeof $$signature = $$signature
    static readonly context: typeof $$context = $$context

    //// Static ////

    static [Trait.onUse](constructor: object) {
        // Makes instanceof work (more or less) on objects implementing the Callable trait
        define.hidden(
            constructor,
            Symbol.hasInstance,
            isInstanceOfCallable
        )
    }

    static override apply<F extends Func>(instance: Callable<F>): Callable<F> {

        // Create callable instance
        function callable(this: unknown, ...args: unknown[]): unknown {

            // Update outer 'this' context
            define.hidden(callable, $$context, this)

            const signature = (callable as unknown as Callable<Func>)[$$signature]
            return signature.apply(callable, args)
        }

        // Add instance properties
        define.transpose(instance, callable, [Function.prototype])

        return callable as unknown as Callable<F>
    }

    static override is: <F extends Func>(input: unknown) => input is Callable<F> = 
        isIntersection(
            isFunc,
            isShape({
                [$$signature]: isFunc
            })
        ) as AnyTypeGuard

} as CallableConstructor 

//// Export ////

export {
    Callable,
    CallableConstructor,
    CallableStaticProperties
}