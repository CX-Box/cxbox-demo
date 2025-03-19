import React from 'react'
import { Column as AntColumn, Line as AntLine } from '@ant-design/plots'
import { useChart2D } from '@components/widgets/Chart/hooks/useChart2D'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { LineConfig } from '@ant-design/plots/es/components/line'
import { Chart2DWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'

interface Chart2DProps {
    meta: Chart2DWidgetMeta
}

const Chart2D: React.FC<Chart2DProps> = ({ meta }) => {
    const configChart2D = useChart2D(meta)

    if (!configChart2D) {
        return null
    }

    return meta.type === CustomWidgetTypes.Column2D ? (
        <AntColumn {...(configChart2D as ColumnConfig)} />
    ) : (
        <AntLine {...(configChart2D as LineConfig)} />
    )
}

export default Chart2D
