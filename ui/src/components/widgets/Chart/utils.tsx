import { G2PlotDatum } from '@ant-design/plots'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { DataItem } from '@cxbox-ui/core'
import { WidgetField, WidgetListField } from '@cxbox-ui/schema'
import { normalizeFieldValue } from '@components/TemplatedTitle/utils'
import { Chart2DConfig, CustomWidgetTypes } from '@interfaces/widget'
import './innerValueLabels'

export const getChartIconByWidgetType = (widgetType: CustomWidgetTypes) => {
    switch (widgetType) {
        case CustomWidgetTypes.Pie1D:
            return 'pie-chart'
        case CustomWidgetTypes.Column2D:
            return 'bar-chart'
        case CustomWidgetTypes.Line2D:
        default:
            return 'line-chart'
    }
}

export const getItemDescriptionValue = (item: G2PlotDatum, descriptionFieldKey?: string[]) => {
    const result: string[] = []
    descriptionFieldKey?.forEach(fieldKey => item?.[fieldKey] && result.push(item[fieldKey]))

    return result.length ? result.join(', ') : null
}

export const getItemColor = (item: G2PlotDatum, data: DataItem[], fieldMeta: WidgetListField) => {
    const fieldKey = Object.keys(item)?.[0]
    const dataItem = data.find(dataItem => dataItem[fieldKey] === item[fieldKey])
    const colorKey = fieldMeta?.bgColorKey

    return colorKey ? (dataItem?.[colorKey] as string) : fieldMeta?.bgColor
}

/**
 * Value labels of Column2D and of the columns in DualAxes2D.
 * White bold text with a dark outline reads on a column of any color. The value is formatted by the field type, as everywhere on the screen.
 */
export function getValueLabel(
    field: WidgetField | undefined,
    position: Chart2DConfig['valuePosition'],
    mode: Chart2DConfig['mode']
): ColumnConfig['label'] {
    if (!field || !position) {
        return undefined
    }

    const inner = position === 'inner'
    const horizontal = mode === 'LR' || mode === 'RL'
    const reflected = mode === 'TB' || mode === 'RL'
    // The column of the value grows down or to the left.
    const growsBack = (value: number) => value < 0 !== reflected
    const style = { fill: '#fff', stroke: '#000', lineWidth: 1, fontWeight: 700 }

    return {
        // Bar's right position follows the value end, including negative values.
        position: inner ? 'middle' : datum => (horizontal ? 'right' : growsBack(datum[field.key]) ? 'bottom' : 'top'),
        autoRotate: false,
        offset: inner ? 0 : 8,
        style,
        // G2 does not mirror the alignment of an outer label in a reflected direction (TB, RL).
        callback:
            inner || !reflected
                ? undefined
                : (value: number) => ({
                      style: horizontal
                          ? { ...style, textAlign: growsBack(value) ? 'right' : 'left' }
                          : { ...style, textBaseline: growsBack(value) ? 'top' : 'bottom' }
                  }),
        content: datum => {
            const value = datum[field.key]
            return typeof value === 'number' && Number.isFinite(value) ? String(normalizeFieldValue(value, field) ?? '') : ''
        },
        layout: [{ type: 'limit-in-plot' }, { type: inner ? 'interval-shift-overlap' : 'interval-hide-overlap' }]
    }
}
