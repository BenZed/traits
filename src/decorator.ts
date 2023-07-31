import { each } from '@benzed/each'
import { isFunc } from '@benzed/types'
import { define } from '@benzed/util'

//// Types ////

interface Trait {}

interface TraitGuard {
    is(input: unknown): input is Trait
}

type TraitDefinition =
    | ((new () => Trait) & TraitGuard)
    | ((abstract new () => Trait) & TraitGuard)

//// Decorator ////

/**
 * Decorate a class as a trait.
 */
function trait<I extends TraitDefinition>(
    Trait: I,
    context: ClassDecoratorContext
) {
    // Validation
    context.addInitializer(() => {
        if (context.kind !== 'class')
            throw new Error(
                `${trait.name} may only be used to decorate classes.`
            )

        if (!isFunc(Trait.is))
            throw new Error(
                `${trait.name}s require a static type guard property named ${
                    'is' satisfies keyof I
                }`
            )

        const chain = each.prototypeOf(Trait).toArray()
        if (chain.length > 3)
            throw new Error(`${trait.name} may not decorate extended classes.`)
    })

    return define.named(
        Trait.name,
        class extends Trait {
            /**
             * @internal
             * Any object that fulfills the structural contract outlined
             * by the type guard is considered an instanceof that trait.
             */
            static [Symbol.hasInstance](input: unknown) {
                return this.is(input)
            }

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
