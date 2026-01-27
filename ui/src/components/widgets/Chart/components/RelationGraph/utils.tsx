import { DataItem } from '@cxbox-ui/core'
import { WidgetListField } from '@cxbox-ui/schema'
import { IGraph } from '@ant-design/graphs'

export const mapToFlowGraphData = (
    data: DataItem[],
    sourceNodeKey: string,
    targetNodeKey: string,
    labelFieldKeys?: string[],
    descriptionFieldKeys?: string[]
) => {
    const nodesMap = new Map<string, any>()
    const edges: any[] = []
    const [nodeTitle, ...rest] = descriptionFieldKeys || []

    data.forEach((item: any) => {
        // target-node
        if (!nodesMap.has(item[targetNodeKey])) {
            nodesMap.set(item[targetNodeKey], {
                id: item[targetNodeKey],
                value: {
                    title: item[nodeTitle || targetNodeKey],
                    ...(rest?.length
                        ? {
                              items: rest.map(key => ({
                                  text: item[key]
                              }))
                          }
                        : {}),
                    type: item.targetNodeType ?? 'default',
                    expanded: item.targetNodeExpanded
                }
            })
        }

        // edge
        if (item[sourceNodeKey]) {
            edges.push({
                edgeId: item.id,
                source: item[sourceNodeKey],
                target: item[targetNodeKey],
                ...(labelFieldKeys?.length
                    ? {
                          value: labelFieldKeys
                              .map(key => item[key])
                              .filter(val => val != null)
                              .join(', ')
                      }
                    : {})
            })
        }
    })

    return {
        nodes: Array.from(nodesMap.values()),
        edges
    }
}

export const hasDuplicateEdges = (data: DataItem[], sourceNodeKey: string, targetNodeKey: string) => {
    const seen = new Set<string>()

    for (const item of data) {
        if (!item[sourceNodeKey]) {
            continue
        }

        const key = `${item[sourceNodeKey]}->${item[targetNodeKey]}`

        if (seen.has(key)) {
            return true
        }

        seen.add(key)
    }

    return false
}

export const hasCycles = (data: DataItem[], sourceNodeKey: string, targetNodeKey: string) => {
    const graph = new Map<string, string[]>()

    data.forEach((item: any) => {
        if (!item[sourceNodeKey]) {
            return
        }

        if (!graph.has(item[sourceNodeKey])) {
            graph.set(item[sourceNodeKey], [])
        }

        graph.get(item[sourceNodeKey])!.push(item[targetNodeKey])
    })

    const visited = new Set<string>()
    const stack = new Set<string>()

    const dfs = (node: string): boolean => {
        if (stack.has(node)) {
            return true
        }

        if (visited.has(node)) {
            return false
        }

        visited.add(node)
        stack.add(node)

        const neighbors = graph.get(node) || []
        for (const next of neighbors) {
            if (dfs(next)) {
                return true
            }
        }

        stack.delete(node)
        return false
    }

    for (const node of graph.keys()) {
        if (dfs(node)) {
            return true
        }
    }

    return false
}

export const collapseNodeRecursively = (graph: IGraph, nodeId: string) => {
    const edges = graph.getEdges().filter((edge: any) => edge.getSource().getID() === nodeId)

    edges.forEach(edge => {
        const target = edge.getTarget()

        graph.hideItem(edge)
        graph.hideItem(target)

        collapseNodeRecursively(graph, target.getID())
    })
}

export const getEdgeBgColor = (itemId: string, data: DataItem[], fieldMeta?: WidgetListField) => {
    const colorKey = fieldMeta?.bgColorKey

    if (colorKey) {
        const dataItem = data.find(item => item.id === itemId)

        return dataItem?.[colorKey] as string
    } else {
        return fieldMeta?.bgColor
    }
}

export const getNodeBgColor = (targetNodeId: string, targetNodeKey: string, data: DataItem[], fieldMeta?: WidgetListField) => {
    const colorKey = fieldMeta?.bgColorKey

    if (colorKey) {
        const dataItem = data.find(item => item[targetNodeKey] === targetNodeId)

        return dataItem?.[colorKey] as string
    } else {
        return fieldMeta?.bgColor
    }
}

export const showSubTree = (graph: IGraph, nodeId: string) => {
    const queue = [nodeId]
    const visited = new Set()

    while (queue.length) {
        const current = queue.shift()
        if (visited.has(current)) {
            continue
        }
        visited.add(current)

        graph.getEdges().forEach((edge: any) => {
            const { source, target } = edge.getModel()

            if (source === current) {
                graph.showItem(edge)
                graph.showItem(target)
                graph.updateItem(target, { collapsed: false })
                queue.push(target)
            }
        })
    }
}
