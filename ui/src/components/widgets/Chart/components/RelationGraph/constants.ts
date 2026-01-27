import { MarkerPosition } from '@ant-design/graphs'

export const defaultSourceKey = 'sourceNodeId'
export const defaultTargetKey = 'targetNodeId'
export const edgeFieldKey = 'edgeValue'

export const defaultMode = 'TB'
export const defaultEdgeType = 'polyline'
export const defaultBadgeColor = '#40A9FF'
export const defaultEdgeColor = '#CCC'
export const drillDownEdgeColor = '#1890FF'
export const mainNodeColor = '#9FBBEF'
export const nodeColor = '#E6EAF1'

export const anchorPointsByMode: Record<string, number[][]> = {
    TB: [
        [0.5, 0],
        [0.5, 1]
    ],
    BT: [
        [0.5, 1],
        [0.5, 0]
    ],
    LR: [
        [1, 0.5],
        [0, 0.5]
    ],
    RL: [
        [0, 0.5],
        [1, 0.5]
    ]
}

export const markerPositionByMode: Record<string, MarkerPosition> = {
    TB: 'bottom',
    BT: 'top',
    LR: 'right',
    RL: 'left'
}
