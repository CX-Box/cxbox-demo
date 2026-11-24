import React from 'react'
import { Line as AntLine } from '@ant-design/plots'
import { useChart2D } from '@components/widgets/Chart/hooks/useChart2D'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { LineConfig } from '@ant-design/plots/es/components/line'
import { Chart2DWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import Column2D from './Column2D'
import ChartRowsWrapper from '../ChartRowsWrapper/ChartRowsWrapper'

interface Chart2DProps {
    meta: Chart2DWidgetMeta
}

const Chart2D: React.FC<Chart2DProps> = ({ meta }) => {
    const configChart2D = useChart2D(meta)

    if (!configChart2D) {
        return null
    }

    return (
        <ChartRowsWrapper widgetName={meta.name} maxRows={meta.options.chart2D.maxRows}>
            {meta.type === CustomWidgetTypes.Column2D ? (
                <Column2D
                    config={configChart2D as ColumnConfig}
                    mode={meta.options.chart2D.mode}
                    valuePosition={meta.options.chart2D.valuePosition}
                    valueField={meta.fields.find(field => field.key === meta.options.chart2D.yValueFieldKey)}
                />
            ) : (
                <AntLine {...(configChart2D as LineConfig)} />
            )}
        </ChartRowsWrapper>
    )
}

export default Chart2D
