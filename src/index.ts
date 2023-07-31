import { trait, Trait, TraitDefinition } from './decorator'

import { CompositeClass, CompositeInstanceType, addTraits } from './add-traits'

import { mergeTraits } from './merge-traits'

//// Consumer ////

/**
 * Create a new class by combining a number of traits
 */
function Traits<T extends readonly TraitDefinition[]>(...traits: T) {
    return addTraits(class {}, ...traits)
}

/**
 * Extend a class by adding traits to it
 */
Traits.add = addTraits

/**
 * Combine a number of traits into one
 */
Traits.combine = mergeTraits

//// Exports ////

export default Traits

export { trait, Traits }

export type { Trait, CompositeClass, CompositeInstanceType, TraitDefinition }
