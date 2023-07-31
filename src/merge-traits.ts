import { each } from '@benzed/each'
import { define } from '@benzed/util'
import { Intersect, isSymbol, StructStatic } from '@benzed/types'

import { CompositeInstanceType, addTraits } from './add-traits'
import { trait, TraitDefinition } from './decorator'

//// Helper Types ////

type _AllSymbolsOf<T extends readonly TraitDefinition[]> = T extends [
    infer T1,
    ...infer Tr
]
    ? Tr extends TraitDefinition[]
        ? [_SymbolsOf<T1>, ..._AllSymbolsOf<Tr>]
        : [_SymbolsOf<T1>]
    : []

type _SymbolsOf<T> = {
    [K in keyof T as T[K] extends symbol ? K : never]: T[K]
}

//// Types ////

type MergedTrait<T extends readonly TraitDefinition[]> =
    (new () => CompositeInstanceType<T>) &
        Intersect<_AllSymbolsOf<T>> &
        StructStatic

//// Exports ////

export function mergeTraits<T extends readonly TraitDefinition[]>(
    ...traits: T
): MergedTrait<T> {
    // @ts-expect-error Add composite is TypeGuard
    @trait
    class CompositeTrait {
        static is(input: unknown): input is CompositeInstanceType<T> {
            for (const trait of traits) {
                if (!trait.is(input)) return false
            }
            return true
        }
    }

    // Add Static Symbols
    for (const trait of traits) {
        // apply prototypal implementations
        for (const [key, descriptor] of each.defined.descriptorOf(
            trait.prototype
        ))
            define(CompositeTrait.prototype, key, descriptor)

        // attach constructor symbols
        for (const key of each.keyOf(trait)) {
            const value = trait[key]
            if (isSymbol(value)) {
                // eslint-disable-next-line
                (CompositeTrait as any)[key] = value
            }
        }
    }

    return addTraits(CompositeTrait, ...traits) as unknown as MergedTrait<T>
}
