import { define, Func } from '@benzed/util'

import { Trait } from '../trait'
import { Callable } from './callable'

//// Main ////

/**
 * Convenience base class implementing the Callable trait that
 * simply takes the call signature as an argument.
 */
const Method = class extends Trait.use(Callable) {

    static readonly signature: typeof Callable.signature = Callable.signature
    static readonly context: typeof Callable.context = Callable.context

    constructor(signature: Func) {
        super()
        define.hidden(this, Callable.signature, signature)
        return Callable.apply(this)
    }

} as abstract new <F extends Func>(signature: F) => Callable<F>

//// Exports ////

export { Method }