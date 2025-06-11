import { AppWidgetMeta, InternalWidgetOption } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { shallowEqual } from 'react-redux'
import { selectBc, selectBcData, selectBcUrlRowMeta, selectWidget } from '@selectors/selectors'

export const getInnerWidgetOptions = (externalWidget: AppWidgetMeta | undefined, type: 'create' | 'edit') => {
    return externalWidget?.options?.[type]
}

const checkInnerWidgetOptions = (externalWidget: AppWidgetMeta | undefined, type: 'create' | 'edit') => {
    const innerWidgetOptions = getInnerWidgetOptions(externalWidget, type)
    if (innerWidgetOptions?.style === 'inlineForm' && !innerWidgetOptions?.widget) {
        console.error(`Widget "name": ${externalWidget?.name} has meta inspection warning! 
Inspection Description: options.${type}.widget must be set for options.${type}.style = "inlineForm" and must not be set in other cases
Fallback behavior: options.${type}.style = "inline", because ${type} widget was not set.`)
    }
    if (innerWidgetOptions?.style === 'inline' && innerWidgetOptions?.widget) {
        console.error(`Widget "name": ${externalWidget?.name} has meta inspection warning! 
Inspection Description: options.${type}.widget must be set for options.${type}.style = "inlineForm" and must not be set in other cases
Fallback behavior: options.${type}.style = "inline" has higher priority than options.${type}.widget`)
    }
    if (innerWidgetOptions?.style === 'none' && innerWidgetOptions?.widget) {
        console.error(`Widget "name": ${externalWidget?.name} has meta inspection warning! 
Inspection Description: options.${type}.widget must be set for options.${type}.style = "inlineForm" and must not be set in other cases
Fallback behavior: options.${type}.style = "none" has higher priority than options.${type}.widget`)
    }
}

const STYLES_WITHOUT_WIDGETS: InternalWidgetOption['style'][] = ['inline', 'none']

export const getDefaultInnerWidgetStyle = (
    widget: InternalWidgetOption['widget'] | undefined,
    style: InternalWidgetOption['style'] | undefined
) => {
    return !style && widget ? 'inlineForm' : style
}

export const checkInnerWidgetVisibility = (
    currentStyle: InternalWidgetOption['style'],
    innerWidgetOptions: Partial<InternalWidgetOption> | undefined
) => {
    const innerWidgetStyle = getDefaultInnerWidgetStyle(innerWidgetOptions?.widget, innerWidgetOptions?.style)

    return !STYLES_WITHOUT_WIDGETS.includes(currentStyle) && currentStyle === innerWidgetStyle
}

export function useInternalWidgetSelector(externalWidget: AppWidgetMeta | undefined, style: InternalWidgetOption['style']) {
    return useAppSelector(state => {
        const createWidgetOptions = getInnerWidgetOptions(externalWidget, 'create')
        const widgetForCreate = checkInnerWidgetVisibility(style, createWidgetOptions)
            ? (selectWidget(state, createWidgetOptions?.widget) as AppWidgetMeta)
            : undefined

        const editWidgetOptions = getInnerWidgetOptions(externalWidget, 'edit')
        const widgetForEdit = checkInnerWidgetVisibility(style, editWidgetOptions)
            ? (selectWidget(state, editWidgetOptions?.widget) as AppWidgetMeta)
            : undefined

        checkInnerWidgetOptions(externalWidget, 'create')
        checkInnerWidgetOptions(externalWidget, 'edit')

        const bc = selectBc(state, (widgetForCreate || widgetForEdit)?.bcName)
        const rowMeta = selectBcUrlRowMeta(state, bc?.name)
        const data = selectBcData(state, bc?.name)

        const currentDataItem = data?.find(dataItem => dataItem.id === bc?.cursor)
        const isCreateStyle = currentDataItem?.vstamp === -1

        return {
            internalWidget: isCreateStyle ? widgetForCreate : widgetForEdit,
            internalWidgetRowMeta: rowMeta,
            internalWidgetData: data,
            internalWidgetOperations: rowMeta?.actions,
            internalWidgetActiveCursor: bc?.cursor,
            isCreateStyle: isCreateStyle,
            isEditStyle: !isCreateStyle
        }
    }, shallowEqual)
}
