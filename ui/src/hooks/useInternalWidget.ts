import { AppWidgetMeta, InternalWidgetOption, InternalWidgetStyle } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { selectBc, selectBcData, selectBcUrlRowMeta, selectWidget } from '@selectors/selectors'
import { useMemo } from 'react'
import { WidgetMeta } from '@cxbox-ui/core'

export type InternalWidgetOptionsName = KeysMatching<Required<NonNullable<AppWidgetMeta['options']>>, InternalWidgetOption>

interface WidgetWithInternalWidgetOptions {
    options: { [K in InternalWidgetOptionsName]?: NonNullable<AppWidgetMeta['options']>[K] }
}

type CompatibleWidget = WidgetMeta | WidgetWithInternalWidgetOptions | undefined

export function hasInternalWidgetOptions(widget: CompatibleWidget): widget is WidgetWithInternalWidgetOptions {
    if (!widget?.options) {
        return false
    }

    const options = widget.options as WidgetWithInternalWidgetOptions['options']

    return options.create !== undefined || options.edit !== undefined
}

const resolveInternalWidgetStyle = (style: InternalWidgetStyle | undefined, existWidget: boolean): InternalWidgetStyle => {
    if (existWidget) {
        return style ?? 'inlineForm'
    }
    return !style || style === 'inlineForm' ? 'inline' : style
}

export function useInternalWidgetByType(
    externalWidget: CompatibleWidget,
    type: InternalWidgetOptionsName,
    style?: InternalWidgetOption['style']
) {
    const internalWidgetOptions = hasInternalWidgetOptions(externalWidget) ? externalWidget.options?.[type] : undefined
    const widget = useAppSelector(selectWidget(internalWidgetOptions?.widget))
    const resolvedStyle = resolveInternalWidgetStyle(internalWidgetOptions?.style, !!widget)

    return useMemo(
        () =>
            !style || style === resolvedStyle
                ? {
                      widget: widget,
                      bcName: widget?.bcName,
                      style: resolvedStyle,
                      hidden: !widget || style === 'none'
                  }
                : undefined,
        [resolvedStyle, style, widget]
    )
}

export function useInternalWidget(externalWidget: CompatibleWidget, style?: InternalWidgetOption['style']) {
    const createWidgetParams = useInternalWidgetByType(externalWidget, 'create', style)
    const editWidgetParams = useInternalWidgetByType(externalWidget, 'edit', style)

    const bcName = createWidgetParams?.bcName || editWidgetParams?.bcName // Internal widgets should have the same bcName
    const bc = useAppSelector(selectBc(bcName))
    const bcData = useAppSelector(selectBcData(bcName))
    const isCreateStyle = useMemo(() => {
        return bcData?.find(dataItem => dataItem.id === bc?.cursor)?.vstamp === -1
    }, [bcData, bc?.cursor])
    const rowMeta = useAppSelector(selectBcUrlRowMeta(bcName, true))

    const resolvedWidgetParams = isCreateStyle ? createWidgetParams : editWidgetParams

    return useMemo(
        () => ({
            internalWidget: resolvedWidgetParams?.widget,
            internalWidgetStyle: resolvedWidgetParams?.style,
            internalWidgetRowMeta: rowMeta,
            internalWidgetData: bcData,
            internalWidgetOperations: rowMeta?.actions,
            internalWidgetActiveCursor: bc?.cursor,
            isCreateStyle: isCreateStyle,
            isEditStyle: !isCreateStyle,
            hidden: resolvedWidgetParams?.hidden
        }),
        [
            bc?.cursor,
            bcData,
            isCreateStyle,
            resolvedWidgetParams?.hidden,
            resolvedWidgetParams?.style,
            resolvedWidgetParams?.widget,
            rowMeta
        ]
    )
}
