import { G2PlotDatum } from '@ant-design/plots'
import { DataItem } from '@cxbox-ui/core'
import { WidgetListField } from '@cxbox-ui/schema'

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
