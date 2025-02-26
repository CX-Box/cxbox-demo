import { LineConfig } from '@ant-design/plots/es/components/line'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
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
