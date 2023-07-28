
import { Trait } from '../trait'
import Mutate from './mutate'

//// Main ////

type Mutator<T extends object> = Mutate<T> & { readonly [Mutate.target]: T }

type MutatorConstructorSignature = abstract new <T extends object>(target: T) => Mutator<T>

interface MutatorConstructor extends MutatorConstructorSignature {
    readonly target: typeof Mutate.target
    readonly get: typeof Mutate.get
    readonly set: typeof Mutate.set
    readonly has: typeof Mutate.has
    readonly ownKeys: typeof Mutate.ownKeys
    readonly getPrototypeOf: typeof Mutate.getPrototypeOf
    readonly setPrototypeOf: typeof Mutate.setPrototypeOf
    readonly defineProperty: typeof Mutate.defineProperty
    readonly deleteProperty: typeof Mutate.deleteProperty
    readonly getOwnPropertyDescriptor: typeof Mutate.getOwnPropertyDescriptor

}
/**
 * Convenience base class implementing the Mutator trait that
 * simply takes the target as an argument
 */
const Mutator = class extends Trait.use(Mutate) {

    static readonly target: typeof Mutate.target = Mutate.target
    static readonly get: typeof Mutate.get = Mutate.get
    static readonly set: typeof Mutate.set = Mutate.set
    static readonly has: typeof Mutate.has = Mutate.has
    static readonly ownKeys: typeof Mutate.ownKeys = Mutate.ownKeys
    static readonly getPrototypeOf: typeof Mutate.getPrototypeOf = Mutate.getPrototypeOf
    static readonly setPrototypeOf: typeof Mutate.setPrototypeOf = Mutate.setPrototypeOf
    static readonly defineProperty: typeof Mutate.defineProperty = Mutate.defineProperty
    static readonly deleteProperty: typeof Mutate.deleteProperty = Mutate.deleteProperty
    static readonly getOwnPropertyDescriptor: typeof Mutate.getOwnPropertyDescriptor = Mutate.getOwnPropertyDescriptor

    readonly [Mutate.target]!: object

    constructor(target: object) {
        super()
        this[Mutate.target] = target
        return Mutate.apply(this)
    }

} as MutatorConstructor

//// Exports ////

export { Mutator }