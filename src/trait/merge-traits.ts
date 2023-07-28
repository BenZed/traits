import {
    AnyTypeGuard,
    define,
    each,
    Intersect,
    isFunc,
    isIntersection,
    isSymbol
} from '@benzed/util'

import {
    $$onUse,
    AddTraitsConstructor,
    Composite,
    _Traits
} from './add-traits'

import { Trait } from './trait'

//// Helper Methods ////

type _AllSymbolsOf<T extends _Traits> = T extends [infer T1, ...infer Tr]
    ? Tr extends _Traits 
        ? [_SymbolsOf<T1>, ..._AllSymbolsOf<Tr>]
        : [_SymbolsOf<T1>]
    : []

type _SymbolsOf<T> = {
    [K in keyof T as T[K] extends symbol
        ? T[K] extends typeof $$onUse
            ? never 
            : K
        : never 
    ]: T[K]
}

//// Merge Traits ////

export type MergedTraitsConstructor<T extends _Traits> = 
    & {
        apply<Tx extends Composite<T>>(instance: Tx): Tx
        is(input: unknown): input is Composite<T>
    } 
    & AddTraitsConstructor<T> 
    & Intersect<_AllSymbolsOf<T>>

/**
 * Combine multiple traits into one.
 */
export function mergeTraits<T extends _Traits>(...Traits: T): MergedTraitsConstructor<T> {

    class MergedTrait extends Trait {

        // Intersect all is methods
        static override is = isIntersection(
            ...Traits.map(trait => {

                if (!('is' in trait) || !isFunc(trait.is))
                    throw new Error(`${trait.name} does not have a static \'is\' typeguard.`)

                return trait.is as AnyTypeGuard
            })
        ) as AnyTypeGuard

        // Intersect all onApply methods
        static override apply(instance: object) {
            return Trait.apply(instance, ...Traits)
        }

        // Intersect all onUse methods
        static [$$onUse](constructor: object) {
            for (const Trait of Traits) {
                if ($$onUse in Trait && isFunc(Trait[$$onUse]))
                    Trait[$$onUse](constructor)
            }
        }
    }

    // Add Static Symbols
    for (const Trait of Traits) {

        // apply prototypal implementations
        for (const [key, descriptor] of each.defined.descriptorOf(Trait.prototype))
            define(MergedTrait.prototype, key, descriptor)

        // attach constructor symbols
        for (const key of each.keyOf(Trait)) {
            const value = Trait[key]
            if (!isSymbol(value) || value === $$onUse)
                continue

            MergedTrait[key] = value
        }
    }

    const name = [...Traits].map(c => c.name).join('')
    define.named(name, MergedTrait) 

    return MergedTrait as unknown as MergedTraitsConstructor<T>
}