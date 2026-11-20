import React, { useMemo } from 'react'
import { Bar, Column } from '@ant-design/plots'
import { BarConfig } from '@ant-design/plots/es/components/bar'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { Chart2DConfig } from '@interfaces/widget'
import { WidgetField } from '@cxbox-ui/schema'
import { getValueLabel } from './valueLabels'

interface Column2DProps {
    config: ColumnConfig
    orientation?: Chart2DConfig['orientation']
    valuePosition?: Chart2DConfig['valuePosition']
    valueField?: WidgetField
}

const Column2D: React.FC<Column2DProps> = ({ config, orientation, valuePosition, valueField }) => {
    const label = useMemo(() => getValueLabel(valueField, valuePosition, orientation), [valueField, valuePosition, orientation])
    const columnConfig = label ? { ...config, label } : config

    if (orientation !== 'horizontal') {
        return <Column {...columnConfig} />
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
        // Preserve Column's legend placement when changing only orientation.
        legend:
            config.legend === false || config.legend?.position
                ? config.legend
                : { ...config.legend, position: config.isStack ? 'right-top' : 'top-left' },
        barStyle: columnStyle,
        barWidthRatio: columnWidthRatio,
        minBarWidth: minColumnWidth,
        maxBarWidth: maxColumnWidth,
        barBackground: columnBackground
    }

    return <Bar {...barConfig} />
}

export default Column2D
