import { WidgetTypes } from '@cxbox-ui/core'
import { AppWidgetMeta, FileUploadFieldMeta } from '@interfaces/widget'
import { isDefined } from '@utils/isDefined'
import { useEffect, useState } from 'react'

const supportedWidgetTypes: string[] = [WidgetTypes.Form, WidgetTypes.Info]

const resolvePreviewEnabledForInternalWidget = (widget: AppWidgetMeta | undefined, widgetField: FileUploadFieldMeta | undefined) => {
    if (!widget) {
        return false
    }

    if (!supportedWidgetTypes.includes(widget.type)) {
        console.error(
            `Meta inspection warning: widget "${widget.name}" inside CardList/CardCarouselList has unsupported type "${
                widget.type
            }". Supported types: ${supportedWidgetTypes.join(', ')}.`
        )
        return false
    }

    const preview = widgetField?.preview

    if (!preview) {
        return false
    }

    if (preview.enabled === false) {
        if (isDefined(preview.mode)) {
            console.error(
                `Meta inspection warning: widget "${widget.name}" inside CardList/CardCarouselList has preview.mode set, but it is ignored when preview.enabled=false.`
            )
        }
        return false
    }

    if (preview.enabled !== true) {
        return false
    }

    if (!isDefined(preview.mode) || preview.mode !== 'inline') {
        console.warn(
            `Meta inspection warning: widget "${widget.name}" inside CardList/CardCarouselList has unsupported preview.mode. Only "inline" is supported.`
        )
    }

    return true
}

const resolvePreviewEnabledForCard = (widget: AppWidgetMeta | undefined, widgetField: FileUploadFieldMeta | undefined) => {
    if (!widget) {
        return false
    }

    const preview = widgetField?.preview

    if (!preview) {
        return false
    }

    if (preview.enabled === false) {
        if (isDefined(preview.mode)) {
            console.error(
                `Meta inspection warning: widget "${widget.name}" has preview.mode set, but it is ignored when preview.enabled=false.`
            )
        }
        return false
    }

    if (preview.enabled !== true) {
        return false
    }

    if (!isDefined(preview.mode) || preview.mode !== 'inline') {
        console.warn(`Meta inspection warning: widget "${widget.name}"  has unsupported preview.mode. Only "inline" is supported.`)
    }

    return true
}

const resolvePreviewEnabledDefault = (widget: AppWidgetMeta | undefined, widgetField: FileUploadFieldMeta | undefined) => {
    if (!widget) {
        return false
    }

    const preview = widgetField?.preview

    if (!preview) {
        return false
    }

    return preview.enabled
}

const ruleByType = {
    card: resolvePreviewEnabledForCard,
    internalWidget: resolvePreviewEnabledForInternalWidget,
    default: resolvePreviewEnabledDefault
}

export const getResolveRule = (type: keyof typeof ruleByType | undefined) => {
    return type ? ruleByType[type] : ruleByType.default
}

export function usePreviewEnabled(
    widget: AppWidgetMeta | undefined,
    widgetField: FileUploadFieldMeta | undefined,
    type: keyof typeof ruleByType | undefined
) {
    const [previewEnabled, setPreviewEnabled] = useState(false)

    useEffect(() => {
        const resolveRule = getResolveRule(type)
        setPreviewEnabled(resolveRule(widget, widgetField))
    }, [type, widget, widgetField])

    return previewEnabled
}
