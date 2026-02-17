import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { FlowAnalysisGraph as AntFlowAnalysisGraph } from '@ant-design/graphs'
import { useAppDispatch, useAppSelector } from '@store'
import {
    collapseNodeRecursively,
    getEdgeBgColor,
    getNodeBgColor,
    hasCycles,
    hasDuplicateEdges,
    mapToFlowGraphData,
    showSubTree
} from './utils'
import { actions } from '@actions'
import {
    anchorPointsByMode,
    defaultBadgeColor,
    defaultEdgeColor,
    defaultEdgeType,
    defaultMode,
    defaultSourceKey,
    defaultTargetKey,
    defaultWidth,
    drillDownEdgeColor,
    edgeFieldKey,
    edgeTextColor,
    endArrowSize,
    height,
    mainNodeColor,
    markerPositionByMode,
    markerStrokeColor,
    nodeColor,
    nodeHoverShadowColor,
    nodeShadowColor,
    nodeTextColor
} from './constants'
import { WidgetListField } from '@cxbox-ui/core'
import { RelationGraphWidgetMeta } from '@interfaces/widget'
import { FlowAnalysisGraphConfig } from '@ant-design/graphs/es/components/flow-analysis-graph'
import { IEdge, INode } from './interfaces'

interface RelationGraphProps {
    meta: RelationGraphWidgetMeta
    setDataValidationError: () => void
}

const RelationGraph: React.FC<RelationGraphProps> = ({ meta, setDataValidationError }) => {
    const dispatch = useAppDispatch()

    const { name, bcName, fields, options } = meta
    const initialData = useAppSelector(state => state.data[bcName])
    const cursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor)

    const cursorRef = useRef(cursor)

    const { mode, dragNode, nodes, edges } = options?.relationGraph || {}
    const sourceNodeKey = nodes?.fieldKeys?.[0] || defaultSourceKey
    const targetNodeKey = nodes?.fieldKeys?.[1] || defaultTargetKey

    const hasDuplicates = useMemo(
        () => hasDuplicateEdges(initialData, sourceNodeKey, targetNodeKey),
        [initialData, sourceNodeKey, targetNodeKey]
    )

    const hasCycle = useMemo(() => hasCycles(initialData, sourceNodeKey, targetNodeKey), [initialData, sourceNodeKey, targetNodeKey])

    const data = useMemo(() => {
        if (hasDuplicates || hasCycle) {
            return null
        }

        return mapToFlowGraphData(initialData, sourceNodeKey, targetNodeKey, edges?.labelFieldKeys, nodes?.descriptionFieldKeys) as any
    }, [initialData, sourceNodeKey, targetNodeKey, edges?.labelFieldKeys, nodes?.descriptionFieldKeys, hasDuplicates, hasCycle])

    const nodeFieldMeta = useMemo(() => {
        return fields.find(field => field.key === targetNodeKey)
    }, [fields, targetNodeKey])

    const edgeFieldMeta = useMemo(() => {
        return fields.find(field => field.key === edgeFieldKey)
    }, [fields])

    const onClick = useCallback(
        (itemId: string, valueFieldMeta?: WidgetListField) => {
            if (valueFieldMeta?.drillDown) {
                dispatch(
                    actions.userDrillDown({
                        widgetName: name,
                        bcName,
                        fieldKey: valueFieldMeta?.key,
                        cursor: itemId
                    })
                )
            } else if (cursorRef.current !== itemId) {
                dispatch(actions.bcSelectRecord({ bcName, cursor: itemId }))
            }
        },
        [bcName, dispatch, name]
    )

    const getEdgeFill = useCallback(
        (edgeId: string) => {
            const isSelected = cursorRef.current === edgeId
            const edgeColor = getEdgeBgColor(edgeId, initialData, edgeFieldMeta) || defaultEdgeColor

            return edgeFieldMeta?.drillDown || isSelected ? drillDownEdgeColor : edgeColor
        },
        [edgeFieldMeta, initialData]
    )

    const config: FlowAnalysisGraphConfig | null = useMemo(
        () =>
            data && {
                autoFit: true,
                fitCenter: true,
                data,
                layout: {
                    rankdir: mode || defaultMode,
                    ranksepFunc: () => 15
                },
                nodeCfg: {
                    size: [nodeFieldMeta?.width || defaultWidth, height],
                    badge: {
                        show: true,
                        style: (node: INode) => ({
                            cursor: 'pointer',
                            fill: getNodeBgColor(node.id, targetNodeKey, initialData, nodeFieldMeta) || defaultBadgeColor,
                            radius: [4, 0, 0, 4]
                        })
                    },
                    anchorPoints: anchorPointsByMode[mode || defaultMode],
                    nodeStateStyles: {
                        hover: {
                            shadowColor: nodeHoverShadowColor,
                            shadowBlur: 8,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0
                        }
                    },
                    title: {
                        containerStyle: (node: INode) => ({
                            cursor: 'pointer',
                            fill: node.value?.type === 'main' ? mainNodeColor : nodeColor,
                            radius: [4, 4, 0, 0]
                        }),
                        style: {
                            cursor: 'pointer',
                            fill: nodeTextColor,
                            fontSize: 12,
                            stroke: nodeTextColor,
                            lineWidth: 0.3
                        }
                    },
                    items: {
                        containerStyle: {
                            cursor: 'pointer'
                        },
                        style: {
                            cursor: 'pointer',
                            fill: nodeTextColor,
                            fontSize: 12
                        }
                    },
                    style: {
                        cursor: 'pointer',
                        stroke: 'transparent',
                        radius: 4,
                        shadowColor: nodeShadowColor,
                        shadowBlur: 8,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0
                    }
                },
                edgeCfg: {
                    label: {
                        style: {
                            cursor: 'pointer',
                            textBaseline: 'bottom',
                            fill: edgeTextColor,
                            fontSize: 12
                        }
                    },
                    type: edges?.type || defaultEdgeType,
                    endArrow: (edge: IEdge) => ({
                        fill: getEdgeFill(edge.edgeId),
                        size: endArrowSize
                    }),
                    style: (edge: IEdge) => {
                        const edgeId = edge.edgeId
                        const isSelected = cursorRef.current === edgeId

                        return {
                            cursor: 'pointer',
                            lineWidth: isSelected ? 2 : 1,
                            stroke: getEdgeFill(edgeId),
                            radius: 4,
                            offset: 20
                        }
                    }
                },
                markerCfg: cfg => {
                    return {
                        position: markerPositionByMode[mode || defaultMode],
                        show: data.edges.find((item: IEdge) => item.source === cfg.id),
                        style: {
                            stroke: markerStrokeColor
                        }
                    }
                },
                behaviors: ['drag-canvas', 'zoom-canvas', ...(dragNode ? ['drag-node'] : [])],
                tooltipCfg: {
                    itemTypes: ['node'],
                    show: true,
                    customContent: item => <div>{item.value.title}</div>
                },
                onReady: graph => {
                    graph.once('afterlayout', () => {
                        const collapsedNodeItems = graph.getNodes().filter(node => !(node.getModel()?.value as any)?.expanded)

                        collapsedNodeItems.forEach(nodeItem => {
                            if (nodeItem.destroyed) {
                                return
                            }

                            collapseNodeRecursively(graph, nodeItem.getID())
                            graph.updateItem(nodeItem, { collapsed: true })
                        })

                        const mainNode = graph.getNodes().find(n => (n.getModel()?.value as any)?.type === 'main')

                        if (mainNode && !mainNode.destroyed) {
                            requestAnimationFrame(() => {
                                graph.focusItem(mainNode, true, {
                                    easing: 'easeCubic',
                                    duration: 300
                                })
                            })
                        }
                    })

                    graph.on('node:click', evt => {
                        const node = evt.item

                        if (!node) {
                            return
                        }

                        if (evt.target.destroyed) {
                            if (!node.getModel().collapsed) {
                                const id = node.getID()
                                showSubTree(graph, id)
                                graph.updateItem(id, { collapsed: false })
                                graph.layout()
                                graph.paint()
                            }
                            return
                        }

                        const edgeId = (node as any).getInEdges()?.[0]?.getModel()?.edgeId

                        if (edgeId) {
                            onClick(edgeId, nodeFieldMeta)
                        }
                    })

                    graph.on('edge:click', evt => {
                        const itemId = evt.item?.getModel()?.edgeId as string

                        if (itemId) {
                            onClick(itemId, edgeFieldMeta)
                        }
                    })
                }
            },
        [data, dragNode, edgeFieldMeta, edges?.type, getEdgeFill, initialData, mode, nodeFieldMeta, onClick, targetNodeKey]
    )

    useEffect(() => {
        cursorRef.current = cursor
    }, [cursor])

    useEffect(() => {
        if (hasDuplicates || hasCycle) {
            setDataValidationError()
        }
    }, [hasCycle, hasDuplicates, setDataValidationError])

    if (!config) {
        return null
    }

    return <AntFlowAnalysisGraph {...config} />
}

export default RelationGraph
