
import { 
    AnyTypeGuard,
    Each, 
    isFunc,
    isIntersection,
    isKeyed,
    isShape,
    isString, 
    nil 
} from '@benzed/util'

import { Node, NodePath } from './node'

import SearchNode from './search-node'

//// Main ////

/**
 * Public node has exposed properties for accessing relations to other nodes.
 */
class PublicNode extends SearchNode { 

    static override is: (input: unknown) => input is PublicNode = isIntersection(
        SearchNode.is,
        isShape({
            name: isString,
            eachNode: isFunc,
            eachChild: isFunc,
            eachParent: isFunc,
            eachSibling: isFunc,
            eachAncestor: isFunc,
            eachDescendent: isFunc,
        }),
        isKeyed('path', 'root', 'parent', 'children')
    ) as AnyTypeGuard

    // is(Node).and.shape({
    //     name: is.string,
    //     path: is.array.of.string.or.number.or.symbol,
    //     root: is(Node),
    //     parent: is(Node).optional,
    //     children: is.array.of(Node),
    //     eachChild: is.function,
    //     eachParent: is.function,
    //     eachSibling: is.function,
    //     eachAncestor: is.function,
    //     eachDescendent: is.function,
    //     eachNode: is.function,
    // }).readonly

    get name(): string {
        const name = Node.getPath(this).at(-1)
        return isString(name) 
            ? name 
            : this.constructor.name
    }

    get path(): NodePath {
        return Node.getPath(this )
    }

    get root(): Node {
        return Node.getRoot(this)
    }

    get parent(): Node | nil {
        return Node.getParent(this)
    }

    get children(): Node[] {
        return Array.from(this.eachChild())
    }

    eachChild(): Each<Node> {
        return Node.eachChild(this)
    }

    eachParent(): Each<Node> {
        return Node.eachParent(this)
    }

    eachSibling(): Each<Node> {
        return Node.eachSibling(this)
    }

    eachAncestor(): Each<Node> {
        return Node.eachAncestor(this)
    }

    eachDescendent(): Each<Node> {
        return Node.eachDescendent(this)
    }

    eachNode(): Each<Node> {
        return Node.eachNode(this)
    }
}

//// Exports ////

export default PublicNode

export {
    PublicNode,
    SearchNode
}