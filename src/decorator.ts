import { each } from '@benzed/each'
import { define } from '@benzed/util'
import { struct, StructStatic } from '@benzed/types'

//// Types ////

interface Trait {}

type TraitDefinition =
    | ((new () => Trait) & StructStatic)
    | ((abstract new () => Trait) & StructStatic)

//// Decorator ////

/**
 * Decorate a class as a trait.
 */
function trait<I extends TraitDefinition>(
    Trait: I,
    context: ClassDecoratorContext
) {
    // Inherit @struct trait
    struct(Trait, context)

    // Validation
    context.addInitializer(() => {
        const chain = each.prototypeOf(Trait).toArray()
        if (chain.length > 3)
            throw new Error(`${trait.name} may not decorate extended classes.`)
    })

    return define.named(
        Trait.name,
        class extends Trait {
            constructor() {
                super()
                throw new Error(
                    this.constructor.name +
                        ` is a ${trait.name} and must not be constructed.`
                )
            }
        }
    )
}

//// Exports ////

export { trait, Trait, TraitDefinition }
