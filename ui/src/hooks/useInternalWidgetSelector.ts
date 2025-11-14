import { AppWidgetMeta, InternalWidgetOption, InternalWidgetStyle } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { selectBc, selectBcData, selectBcUrlRowMeta, selectWidget } from '@selectors/selectors'
import { useMemo } from 'react'

type InnerWidgetOptionsName = KeysMatching<Required<NonNullable<AppWidgetMeta['options']>>, InternalWidgetOption>

const getInternalWidgetStyle = (style: InternalWidgetStyle | undefined, existWidget: boolean): InternalWidgetStyle => {
    if (existWidget) {
        return style ?? 'inlineForm'
    }

    return !style || style === 'inlineForm' ? 'inline' : style
}

export function useInternalWidgetByType(externalWidget: AppWidgetMeta, type: InnerWidgetOptionsName) {
    const internalWidgetOptions = externalWidget.options?.[type]
    const widget = useAppSelector(selectWidget(internalWidgetOptions?.widget))

    const style = getInternalWidgetStyle(internalWidgetOptions?.style, !!widget)

    return useMemo(
        () => ({
            widget: widget,
            bcName: widget?.bcName,
            style,
            hidden: !widget || style === 'none'
        }),
        [style, widget]
    )
}

export function useInternalWidget(externalWidget: AppWidgetMeta) {
    const createWidgetParams = useInternalWidgetByType(externalWidget, 'create')
    const editWidgetParams = useInternalWidgetByType(externalWidget, 'edit')

    const bcName = createWidgetParams?.bcName || editWidgetParams?.bcName // Internal widgets should have the same bcName
    const bc = useAppSelector(selectBc(bcName))
    const bcData = useAppSelector(selectBcData(bcName))
    const isCreateStyle = bcData?.find(dataItem => dataItem.id === bc?.cursor)?.vstamp === -1

    const rowMeta = useAppSelector(selectBcUrlRowMeta(bcName, true))

    const widget = isCreateStyle ? createWidgetParams.widget : editWidgetParams.widget
    const widgetStyle = isCreateStyle ? createWidgetParams.style : editWidgetParams.style
    const widgetHidden = isCreateStyle ? createWidgetParams.hidden : editWidgetParams.hidden

    return useMemo(
        () => ({
            internalWidget: widget,
            internalWidgetStyle: widgetStyle,
            internalWidgetRowMeta: rowMeta,
            internalWidgetData: bcData,
            internalWidgetOperations: rowMeta?.actions,
            internalWidgetActiveCursor: bc?.cursor,
            isCreateStyle: isCreateStyle,
            isEditStyle: !isCreateStyle,
            hidden: widgetHidden
        }),
        [bc?.cursor, bcData, isCreateStyle, rowMeta, widget, widgetHidden, widgetStyle]
    )
}
