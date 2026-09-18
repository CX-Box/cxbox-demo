import { useMemo } from 'react'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { isWidgetFieldBlock } from '@cxbox-ui/core'
import { AiExtractTarget } from '../types'

/**
 * Field types whose value is a plain string. Only they are filled in the first version: a date, a money amount
 * or a multiple choice need their own conversion and are a separate step.
 */
const SUPPORTED_TYPES = ['input', 'text', 'richText', 'dictionary', 'suggestionPickList']

/**
 * Widgets that show the record itself. A widget of steps, a header or statistics live on the same business
 * component too, but their fields are not what a document is about.
 */
const TARGET_WIDGET_TYPES = ['Form', 'Info', 'AdditionalInfo']

/**
 * What to fill: fields of every widget of the current view that shows the record the document hangs on and is
 * open for editing. A screen normally holds several such widgets: "General information", "Реквизиты",
 * "Контакты".
 *
 * A field is identified by the widget it is rendered by together with its key, not by the key alone. One screen
 * can show "Заявитель" and "Ответчик" next to each other: their fields are called the same and mean different
 * things, and the widget is what tells them apart - for us, for the model and for the person.
 *
 * For now only widgets of the business component of the document are taken. Widgets of other components are
 * left alone until saving several components at once is thought through.
 * <p>
 * The fields come in the order they are drawn: widgets by their position on the view, fields by the rows and the
 * columns of options.layout. A form is not always a column, and a person walks it the way they see it, not the
 * way the fields happen to lie in the json.
 */
export function useTargetFields(bcName?: string): AiExtractTarget[] {
    const widgets = useAppSelector(state => state.view.widgets)
    const rowMeta = useAppSelector(state => state.view.rowMeta)
    const bc = useAppSelector(state => state.screen.bo.bc)

    return useMemo(() => {
        if (!bcName) {
            return []
        }
        const targets: AiExtractTarget[] = []
        widgets
            ?.filter(widget => widget.bcName === bcName && TARGET_WIDGET_TYPES.includes(widget.type) && bc[widget.bcName]?.cursor)
            .slice()
            .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
            .forEach(widget => {
                const bcUrl = buildBcUrl(widget.bcName, true)
                const meta = bcUrl ? rowMeta[widget.bcName]?.[bcUrl] : undefined
                if (!meta) {
                    return
                }
                const metaByKey = new Map((meta.fields ?? []).map(field => [field.key, field]))
                const fields: any[] = []
                ;(widget.fields as any[])?.forEach(field => {
                    if (isWidgetFieldBlock(field)) {
                        fields.push(...field.fields)
                    } else {
                        fields.push(field)
                    }
                })
                // optional constraints of the widget json: options.extract.fields.<key>
                const constraints = ((widget as any).options?.extract?.fields ?? {}) as Record<
                    string,
                    { labels?: string[]; pattern?: string; description?: string }
                >
                // the layout of the widget is the order of the screen: row by row, and inside a row column by column
                const drawn = new Map<string, number>()
                ;((widget as any).options?.layout?.rows as { cols?: { fieldKey?: string }[] }[] | undefined)?.forEach(row =>
                    row.cols?.forEach(col => col.fieldKey && !drawn.has(col.fieldKey) && drawn.set(col.fieldKey, drawn.size))
                )
                fields.sort((left, right) => (drawn.get(left.key) ?? drawn.size) - (drawn.get(right.key) ?? drawn.size))
                fields.forEach(field => {
                    const fieldMeta = metaByKey.get(field.key) as any
                    if (!fieldMeta || fieldMeta.disabled || !SUPPORTED_TYPES.includes(field.type)) {
                        return
                    }
                    targets.push({
                        id: `${widget.name}:${field.key}`,
                        key: field.key,
                        label: field.label || field.title,
                        type: field.type,
                        required: !!fieldMeta.required,
                        allowed: (fieldMeta.values as { value: string }[])?.map(item => item.value),
                        labels: constraints[field.key]?.labels,
                        pattern: constraints[field.key]?.pattern,
                        description: constraints[field.key]?.description,
                        bcName: widget.bcName,
                        widget: widget.name,
                        widgetTitle: widget.title,
                        // the field is rendered by the platform itself, both on the form and next to the document
                        meta: field
                    })
                })
            })

        return targets
    }, [bc, bcName, rowMeta, widgets])
}
