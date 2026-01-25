import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { FlowAnalysisGraph as AntFlowAnalysisGraph, IGraph } from '@ant-design/graphs'
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
    defaultMode,
    defaultSourceKey,
    defaultTargetKey,
    edgeFieldKey,
    mainNodeColor,
    markerPositionByMode,
    nodeColor
} from './constants'
import { WidgetListField } from '@cxbox-ui/core'
import { RelationGraphWidgetMeta } from '@interfaces/widget'
import { FlowAnalysisGraphConfig } from '@ant-design/graphs/es/components/flow-analysis-graph'

interface RelationGraphProps {
    meta: RelationGraphWidgetMeta
    setTableView: () => void
}

const RelationGraph: React.FC<RelationGraphProps> = ({ meta, setTableView }) => {
    const dispatch = useAppDispatch()
    const graphRef = useRef<IGraph | null>(null)

    const { name, bcName, fields, options } = meta
    const initialData = useAppSelector(state => state.data[bcName])
    const cursor = useAppSelector(state => state.screen.bo.bc[bcName]?.cursor)

    const { mode, dragNode, nodes, edges } = options?.relationGraph || {}
    const sourceNodeKey = nodes?.fieldKeys?.[0] || defaultSourceKey
    const targetNodeKey = nodes?.fieldKeys?.[1] || defaultTargetKey

    const hasDuplicates = hasDuplicateEdges(initialData, sourceNodeKey, targetNodeKey)
    const hasCycle = hasCycles(initialData, sourceNodeKey, targetNodeKey)
    const data =
        hasDuplicates || hasCycle
            ? null
            : mapToFlowGraphData(initialData, sourceNodeKey, targetNodeKey, edges?.labelFieldKeys, nodes?.descriptionFieldKeys)

    const nodeFieldMeta = useMemo(() => {
        return fields.find(field => field.key === targetNodeKey)
    }, [fields, targetNodeKey])

    const edgeFieldMeta = useMemo(() => {
        return fields.find(field => field.key === edgeFieldKey)
    }, [fields])

    const onClick = useCallback(
        (itemId: string, valueFieldMeta?: WidgetListField) => {
            if (valueFieldMeta?.drillDown) {
                dispatch(actions.userDrillDown({ widgetName: name, bcName, fieldKey: valueFieldMeta?.key, cursor: itemId }))
            } else if (cursor !== itemId) {
                dispatch(actions.bcSelectRecord({ bcName, cursor: itemId }))
            }
        },
        [bcName, cursor, dispatch, name]
    )

    const config: FlowAnalysisGraphConfig | null = useMemo(
        () =>
            data && {
                autoFit: true,
                fitCenter: true,
                data,
                layout: {
                    rankdir: mode || defaultMode,
                    ranksepFunc: () => 20
                },
                nodeCfg: {
                    size: [nodeFieldMeta?.width || 150, 40],
                    badge: {
                        show: true,
                        style: (node: any) => ({
                            fill: getNodeBgColor(node.id, targetNodeKey, initialData as any, nodeFieldMeta) || defaultBadgeColor,
                            radius: [2, 0, 0, 2],
                            cursor: 'pointer'
                        })
                    },
                    anchorPoints: anchorPointsByMode[mode || defaultMode],
                    title: {
                        containerStyle: {
                            cursor: 'pointer',
                            fill: 'transparent'
                        },
                        style: {
                            cursor: 'pointer',
                            fill: '#000',
                            fontSize: 12
                        }
                    },
                    items: {
                        padding: 6,
                        containerStyle: {
                            fill: '#FFF',
                            cursor: 'pointer'
                        },
                        style: {
                            cursor: 'pointer',
                            fill: '#AAA',
                            fontSize: 12
                        }
                    },
                    style: (node: any) => ({
                        cursor: 'pointer',
                        fill: node.value?.type === 'main' ? mainNodeColor : nodeColor,
                        opacity: node.value?.type === 'main' ? 0.7 : 1
                    })
                },
                edgeCfg: {
                    label: {
                        style: {
                            cursor: 'pointer',
                            fill: '#AAA',
                            fontSize: 12
                        }
                    },
                    type: edges?.type || 'polyline',
                    endArrow: {
                        show: true
                    },
                    style: edge => ({
                        cursor: 'pointer',
                        stroke: edgeFieldMeta?.drillDown ? '#1890FF' : getEdgeBgColor((edge as any).id, initialData as any, edgeFieldMeta)
                    })
                },
                markerCfg: cfg => {
                    return {
                        position: markerPositionByMode[mode || defaultMode],
                        show: data.edges.find(item => item.source === cfg.id)
                    }
                },
                behaviors: ['drag-canvas', 'zoom-canvas', ...(dragNode ? ['drag-node'] : [])],
                tooltipCfg: {
                    itemTypes: ['node'], // ['node', 'edge'],
                    show: true,
                    customContent: item => <div>{item.value.title}</div>
                },
                onReady: graph => {
                    graphRef.current = graph

                    const mainNode = graph.getNodes().find(n => (n.getModel()?.value as any)?.type === 'main')

                    if (mainNode) {
                        graph.focusItem(mainNode, true, {
                            easing: 'easeCubic',
                            duration: 300
                        })
                    }

                    const collapsedNodes = data.nodes?.filter(node => !node.value.expanded).map(n => n.id)

                    collapsedNodes?.forEach(collapsedNode => {
                        collapseNodeRecursively(graph, collapsedNode)
                        graph.updateItem(collapsedNode, { collapsed: true })
                    })

                    graph.layout()

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
                            }
                            return
                        }

                        const edgeId = (node as any).getInEdges()?.[0]?.getID()

                        if (edgeId) {
                            onClick(edgeId, nodeFieldMeta)
                        }
                    })

                    graph.on('edge:click', evt => {
                        const itemId = evt?.item?._cfg?.id

                        if (itemId) {
                            onClick(itemId, edgeFieldMeta)
                        }
                    })
                }
            },
        [data, dragNode, edgeFieldMeta, edges?.type, initialData, mode, nodeFieldMeta, onClick, targetNodeKey]
    )

    useEffect(() => {
        return () => {
            graphRef?.current?.destroy()
        }
    }, [])

    useEffect(() => {
        if (hasDuplicates || hasCycle) {
            setTableView()
            console.info(`${name}: there is incorrect data, only table mode is available`)
        }
    }, [hasCycle, hasDuplicates, name, setTableView])

    if (!config) {
        return null
    }

    return <AntFlowAnalysisGraph {...config} />
}

export default RelationGraph
