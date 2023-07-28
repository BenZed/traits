
import { define } from '@benzed/util/lib'
import {
    $$onUse,
    addTraits,
    useTraits,
    _Traits
} from './add-traits'

import { mergeTraits } from './merge-traits'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

/**
 * A Trait is essentially a runtime interface.
 * 
 * Using class syntax to declare abstract properties or partial implementations,
 * a trait will be added to a regular class via mixins.
 * 
 * Extend this class to make traits, use the static methods
 * on this class to apply them.
 */
export abstract class Trait {

    /**
     * Extend an existing class with an arbitrary number of traits
     */
    static readonly add = addTraits

    /**
     * Extend a an arbitrary number of traits into a new class.
     */
    static readonly use = useTraits
    
    /**
     * Merge multiple traits into one.
     */
    static readonly merge = mergeTraits

    /**
     * Given an object and a list of traits, run the static apply method
     * on each trait to the input.
     */
    static apply<T extends object>(input: T, ...traits: _Traits): T

    /**
     * Per convention, any logic or side effects associated with
     * the use of a trait are applied with this method. 
     * 
     * This method is aggregated when merging traits.
     */
    static apply(input: object): object

    static apply(input: object, ...traits: _Traits): object {
        for (const trait of traits)
            input = trait.apply(input)
        return input
    }

    /**
     * Overwrite this method on extended Traits to allow
     * Traits to be tested for type.
     * 
     * This method is aggregated when merging traits.
     */
    static is(input: unknown): input is Trait {
        throw new Error(
            `${this.name} has not implemented a static typeguard named 'is'`
        )
    }

    /**
     * Trait consumers may implement theonUse symbolic
     * method to make static changes to the constructor 
     * when using a trait.
     */
    static readonly onUse: typeof $$onUse = $$onUse

    /**
     * A trait should never be constructed.
     * It exists only to define contracts and optionally implement.
     */
    constructor() {
        throw new Error(
            `${Trait.name} class ${this.constructor.name}'s should ` + 
            'never be constructed.'
        )
    }

}

//// Overrides ////

/**
 * Traits are structrual in nature and don't exist as 
 * instances in practice, so the instanceof operator's 
 * behaviour is modified to mirror the typeguard.
 * 
 * Any object that fulfills the structural contract outlined
 * by the type guard is considered an instanceof that trait.
 */
define.nonEnumerable(Trait, Symbol.hasInstance, function (this: typeof Trait, other: unknown): boolean {
    return this.is(other)
})

//// Exports ////

export {
    Trait as Traits,
    addTraits,
    useTraits,
    mergeTraits
}