/**
 * Search node matching the predicate on the current depth prior to moving to the next depth level
 *
 * @param root Tree root
 * @param predicate Search condition for the target tree node
 * @returns Matching node and a tree depth where this node was found
 */
export function breadthFirstSearch<T>(
    root: T,
    predicate: (current: any) => boolean,
    depth = 1,
    childrenProperty = 'child' as keyof T
): BreadthFirstResult<T> | null {
    // Check the root if we can stop searching
    const rootMatch = predicate(root) && root
    const rootChildren = root[childrenProperty] as unknown as T[]
    if (!rootMatch && !rootChildren) {
        return null
    }
    if (rootMatch) {
        return { node: rootMatch, depth }
    }
    // Check all nodes on current depth
    let simpleLeaf = rootChildren.filter(item => !item[childrenProperty]).find(item => predicate(item))
    if (simpleLeaf) {
        return { node: simpleLeaf, depth: depth + 1 }
    }
    // Move to the next depth
    let resultDepth = depth
    rootChildren.some(item => {
        const search = breadthFirstSearch<T>(item, predicate, resultDepth + 1, childrenProperty ?? ('child' as keyof T))
        simpleLeaf = search?.node
        resultDepth = search?.depth ?? resultDepth
        return search?.node
    })
    return simpleLeaf ? { node: simpleLeaf, depth: resultDepth } : null
}

/**
 * Bredth-first search result
 */
export interface BreadthFirstResult<T> {
    /**
     * Matching node
     */
    node: T
    /**
     * Tree depth where this node was found
     */
    depth: number
}
