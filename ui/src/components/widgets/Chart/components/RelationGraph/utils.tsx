import { fontFamily, fontSize, maxItemsLines, wrapItemsWidthPercent } from './constants'
import { DataItem } from '@cxbox-ui/core'
import { WidgetListField } from '@cxbox-ui/schema'
import { IGraph } from '@ant-design/graphs'
import { IEdge, INode } from './interfaces'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!
ctx.font = `${fontSize}px ${fontFamily}`

const hasValue = (v: any) => v !== undefined && v !== null && v !== ''

export const mapToFlowGraphData = (
    data: DataItem[],
    sourceNodeKey: string,
    targetNodeKey: string,
    nodeWidth: number,
    labelFieldKeys?: string[],
    descriptionFieldKeys?: string[]
) => {
    const nodesMap = new Map<string, INode>()
    const edges: IEdge[] = []
    const [nodeTitle, ...rest] = descriptionFieldKeys || []

    data.forEach((item: any) => {
        const id = item[targetNodeKey]
        if (!id) {
            return
        }

        if (item[sourceNodeKey] && item[targetNodeKey]) {
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

        const newTitle = item[nodeTitle || targetNodeKey] || ' '

        const newItems = rest?.length
            ? rest
                  .map(key => ({
                      text: formatDescriptionByWidth(item[key], nodeWidth * wrapItemsWidthPercent, maxItemsLines)
                  }))
                  .filter(i => hasValue(i.text))
            : undefined

        const newType = item.targetNodeType
        const newExpanded = item.targetNodeExpanded

        const existing = nodesMap.get(id)

        if (!existing) {
            nodesMap.set(id, {
                id,
                value: {
                    title: newTitle,
                    ...(newItems?.length ? { items: newItems } : {}),
                    type: newType ?? 'default',
                    expanded: newExpanded
                }
            })
            return
        }

        if (hasValue(newTitle)) {
            existing.value.title = newTitle
        }

        if (newItems?.length) {
            existing.value.items = newItems
        }

        if (hasValue(newType)) {
            existing.value.type = newType
        }

        if (newExpanded !== undefined && newExpanded !== null) {
            existing.value.expanded = newExpanded
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

export const collapseNodeRecursively = (graph: IGraph, nodeId: string, visited = new Set<string>()) => {
    if (visited.has(nodeId)) {
        return
    }

    visited.add(nodeId)

    const edges = graph.getEdges().filter(edge => edge.getSource().getID() === nodeId)

    edges.forEach(edge => {
        const target = edge.getTarget()

        graph.updateItem(edge, {
            visible: false
        })
        graph.updateItem(target, {
            visible: false
        })

        collapseNodeRecursively(graph, target.getID(), visited)
    })
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

        graph.getEdges().forEach(edge => {
            const { source, target } = (edge as any).getModel()

            if (source === current) {
                graph.updateItem(edge, {
                    visible: true
                })
                graph.updateItem(target, {
                    visible: true
                })
                graph.updateItem(target, { collapsed: false })
                queue.push(target)
            }
        })
    }
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
        return data.find(item => item[targetNodeKey] === targetNodeId && item[colorKey])?.[colorKey]
    } else {
        return fieldMeta?.bgColor
    }
}

export const formatDescriptionByWidth = (text: string, maxWidthPx: number, maxLines: number) => {
    if (!text) {
        return ''
    }

    const clean = text.trim()
    let lines: string[] = []
    let currentLine = ''

    for (let i = 0; i < clean.length; i++) {
        const testLine = currentLine + clean[i]
        const { width } = ctx.measureText(testLine)

        if (width > maxWidthPx) {
            lines.push(currentLine)
            currentLine = clean[i]

            if (lines.length === maxLines) {
                const last = lines[maxLines - 1]
                lines[maxLines - 1] = last.slice(0, -3) + '...'
                return lines.join('\n')
            }
        } else {
            currentLine = testLine
        }
    }

    lines.push(currentLine)

    return lines.slice(0, maxLines).join('\n')
}
