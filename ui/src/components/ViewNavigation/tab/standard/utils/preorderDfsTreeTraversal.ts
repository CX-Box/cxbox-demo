export type NodeType = {
    child?: any[]
    [key: string]: any
}

export const preorderDfsTreeTraversal = <Node extends NodeType = NodeType>(
    node: Node,
    callback: (node: Node, depth: number, parentNode?: Node) => void,
    depth: number = 1,
    parentNode?: Node
) => {
    callback(node, depth, parentNode)

    node.child?.forEach(child => preorderDfsTreeTraversal(child as Node, callback, depth + 1, node))
}
