import { each } from '@benzed/each'
import { define } from '@benzed/util'
import { Intersect } from '@benzed/types'

import { TraitDefinition } from './decorator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper type ////

type ClassStatic<T extends Class> = {
    [K in keyof T]: T[K]
}

////  Types ////

// Move Me to @benzed/types
export type Class =
    | (new (...args: any[]) => object)
    | (abstract new (...args: any[]) => object)

export type InstanceTypes<T extends readonly Class[]> = T extends [
    infer T1,
    ...infer Tr
]
    ? T1 extends Class
        ? Tr extends readonly Class[]
            ? [InstanceType<T1>, ...InstanceTypes<Tr>]
            : [InstanceType<T1>]
        : []
    : []

export type CompositeClass<T extends readonly Class[]> = ClassStatic<T[0]> &
    (new (...params: ConstructorParameters<T[0]>) => CompositeInstanceType<T>)

export type CompositeInstanceType<T extends readonly Class[]> = Intersect<
    InstanceTypes<T>
>

//// Main ////

/**
 * Create an extension of a given class with any number of trait definitions.
 */
export function addTraits<T extends [Class, ...TraitDefinition[]]>(
    ...[Class, ...Traits]: T
): CompositeClass<T> {
    class ClassWithTraits extends Class {}

    for (const Trait of Traits) {
        // apply any prototypal trait implementations
        for (const [key, descriptor] of each.defined.descriptorOf(
            Trait.prototype
        ))
            define(ClassWithTraits.prototype, key, descriptor)
    }

    const compositeClassName = [...Traits, Class].map(c => c.name).join('')
    define.named(compositeClassName, ClassWithTraits)

    return ClassWithTraits as unknown as CompositeClass<T>
}
