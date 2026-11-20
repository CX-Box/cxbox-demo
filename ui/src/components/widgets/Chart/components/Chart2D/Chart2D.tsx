import React from 'react'
import { Line as AntLine } from '@ant-design/plots'
import { useChart2D } from '@components/widgets/Chart/hooks/useChart2D'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { LineConfig } from '@ant-design/plots/es/components/line'
import { Chart2DWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import Column2D from './Column2D'
import ChartContainer from '../ChartContainer/ChartContainer'

interface Chart2DProps {
    meta: Chart2DWidgetMeta
}

const Chart2D: React.FC<Chart2DProps> = ({ meta }) => {
    const configChart2D = useChart2D(meta)

    if (!configChart2D) {
        return null
    }

    return (
        <ChartContainer maxRows={meta.options.chart2D.maxRows}>
            {meta.type === CustomWidgetTypes.Column2D ? (
                <Column2D
                    config={configChart2D as ColumnConfig}
                    orientation={meta.options.chart2D.orientation}
                    valuePosition={meta.options.chart2D.valuePosition}
                    valueField={meta.fields.find(field => field.key === meta.options.chart2D.yValueFieldKey)}
                />
            ) : (
                <AntLine {...(configChart2D as LineConfig)} />
            )}
        </ChartContainer>
    )
}

export default Chart2D
