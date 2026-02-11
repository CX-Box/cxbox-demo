export interface INode {
    id: string
    value: {
        title: string
        items?: Array<{
            text: string
        }>
        type: 'main' | 'default'
        expanded: boolean
    }
}

export interface IEdge {
    edgeId: string
    source: string
    target: string
    value?: string
}
