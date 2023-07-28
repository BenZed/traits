import { Trait, mergeTraits } from './trait'

//// Main ////

/**
 * Interface for consuming traits
 */
function Traits<T extends Trait[]>(...traits: T) {
    //
}

//// Extend ////

Traits.merge = mergeTraits

// Apply traits
// Traits.apply

//// Exports ////

export { Traits }
