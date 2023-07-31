import { each } from '@benzed/each'
import { define } from '@benzed/util'
import { Intersect, Class, AbstractClass } from '@benzed/types'

import { TraitDefinition } from './decorator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper type ////

type ClassStatic<T extends Class | AbstractClass> = {
    [K in keyof T]: T[K]
}

////  Types ////

export type InstanceTypes<T extends readonly (Class | AbstractClass)[]> =
    T extends [infer T1, ...infer Tr]
        ? T1 extends Class | AbstractClass
            ? Tr extends readonly (Class | AbstractClass)[]
                ? [InstanceType<T1>, ...InstanceTypes<Tr>]
                : [InstanceType<T1>]
            : []
        : []

export type CompositeClass<T extends readonly (Class | AbstractClass)[]> =
    ClassStatic<T[0]> &
        (new (
            ...params: ConstructorParameters<T[0]>
        ) => CompositeInstanceType<T>)

export type CompositeInstanceType<
    T extends readonly (Class | AbstractClass)[]
> = Intersect<InstanceTypes<T>>

//// Main ////

/**
 * Create an extension of a given class with any number of trait definitions.
 */
export function addTraits<
    T extends [Class | AbstractClass, ...TraitDefinition[]]
>(...[Class, ...Traits]: T): CompositeClass<T> {
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
