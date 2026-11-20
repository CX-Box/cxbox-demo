import { LineConfig } from '@ant-design/plots/es/components/line'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { Axis } from '@antv/g2plot/src/types/axis'
import { Chart2DWidgetMeta, CustomWidgetTypes } from '@interfaces/widget'
import { getValueLabel } from '../Chart2D/valueLabels'

export const getGeometryOption = (widgetMeta: Chart2DWidgetMeta, chartConfig: ColumnConfig | LineConfig) => ({
    geometry: widgetMeta?.type === CustomWidgetTypes.Column2D ? 'column' : 'line',
    ...(widgetMeta?.type === CustomWidgetTypes.Column2D
        ? {
              columnStyle: (chartConfig as ColumnConfig).columnStyle,
              isGroup: (chartConfig as ColumnConfig).isGroup,
              label: getValueLabel(
                  widgetMeta.fields.find(field => field.key === widgetMeta.options.chart2D.yValueFieldKey),
                  widgetMeta.options.chart2D.valuePosition,
                  'vertical'
              )
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
