import React, { useMemo } from 'react'
import { Bar, Column } from '@ant-design/plots'
import { BarConfig } from '@ant-design/plots/es/components/bar'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { Chart2DConfig } from '@interfaces/widget'
import { WidgetField } from '@cxbox-ui/schema'
import { getValueLabel } from '../../utils'

interface Column2DProps {
    config: ColumnConfig
    mode?: Chart2DConfig['mode']
    valuePosition?: Chart2DConfig['valuePosition']
    valueField?: WidgetField
}

const Column2D: React.FC<Column2DProps> = ({ config, mode, valuePosition, valueField }) => {
    const label = useMemo(() => getValueLabel(valueField, valuePosition, mode), [valueField, valuePosition, mode])
    const columnConfig = label ? { ...config, label } : config

    if (mode !== 'LR' && mode !== 'RL') {
        // TB: the columns grow down from the top.
        return <Column {...columnConfig} coordinate={mode === 'TB' ? [{ type: 'reflectY' }] : undefined} />
    }

    const { xField, yField, xAxis, yAxis, columnStyle, columnWidthRatio, minColumnWidth, maxColumnWidth, columnBackground, ...shared } =
        columnConfig

    // Bar uses physical axes; the widget metadata keeps category/value semantics.
    const barConfig: BarConfig = {
        ...shared,
        xField: yField,
        yField: xField,
        xAxis: yAxis,
        yAxis: xAxis,
        // Preserve Column's legend placement when changing only the direction.
        legend:
            config.legend === false || config.legend?.position
                ? config.legend
                : { ...config.legend, position: config.isStack ? 'right-top' : 'top-left' },
        barStyle: columnStyle,
        barWidthRatio: columnWidthRatio,
        minBarWidth: minColumnWidth,
        maxBarWidth: maxColumnWidth,
        barBackground: columnBackground,
        // RL: the bars grow from right to left.
        coordinate: mode === 'RL' ? [{ type: 'reflectX' }] : undefined
    }

    return <Bar {...barConfig} />
}

export default Column2D
