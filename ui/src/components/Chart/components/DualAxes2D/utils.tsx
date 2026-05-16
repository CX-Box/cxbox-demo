import { LineConfig } from '@ant-design/plots/es/components/line'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { Axis } from '@antv/g2plot/src/types/axis'
import { CustomWidgetTypes } from '@interfaces/widget'

export const getGeometryOption = (widgetType: CustomWidgetTypes, chartConfig: ColumnConfig | LineConfig) => ({
    geometry: widgetType === CustomWidgetTypes.Column2D ? 'column' : 'line',
    ...(widgetType === CustomWidgetTypes.Column2D
        ? {
              columnStyle: (chartConfig as ColumnConfig).columnStyle,
              isGroup: (chartConfig as ColumnConfig).isGroup
          }
        : {
              point: (chartConfig as LineConfig).point
          }),
    seriesField: chartConfig.seriesField,
    isStack: chartConfig.isStack,
    color: chartConfig.color
})

export const getCombinedAxisOptions = (firstChartAxis?: Axis, secondChartAxis?: Axis) => {
    return firstChartAxis && secondChartAxis
        ? {
              max: firstChartAxis.max ?? secondChartAxis.max,
              min: firstChartAxis.min ?? secondChartAxis.min,
              tickInterval: firstChartAxis.tickInterval ?? secondChartAxis.tickInterval,
              title: firstChartAxis.title || secondChartAxis.title
          }
        : {}
}
