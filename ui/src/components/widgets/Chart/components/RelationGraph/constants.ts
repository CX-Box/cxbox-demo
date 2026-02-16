import { MarkerPosition } from '@ant-design/graphs'

export const defaultSourceKey = 'sourceNodeId'
export const defaultTargetKey = 'targetNodeId'
export const edgeFieldKey = 'edgeValue'

export const defaultMode = 'TB'
export const defaultWidth = 150
export const height = 40

export const mainNodeColor = '#A9A9A9'
export const nodeColor = '#F6F6F6'
export const nodeTextColor = '#000'
export const nodeShadowColor = '#A9A9A9'
export const nodeHoverShadowColor = '#1890FF'

export const defaultEdgeType = 'polyline'
export const defaultEdgeColor = '#A9A9A9'
export const edgeTextColor = '#AEAEAE'
export const drillDownEdgeColor = '#1890FF'

export const defaultBadgeColor = '#A9A9A9'
export const markerStrokeColor = '#A9A9A9'
export const endArrowSize = 7

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
