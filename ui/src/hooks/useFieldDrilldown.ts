import { useCallback, useMemo } from 'react'
import { actions } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'
import { AppWidgetMeta, WidgetField } from '@interfaces/widget'

export const useFieldDrilldown = (widget: AppWidgetMeta, fieldKey: string) => {
    const fieldMeta = useMemo(() => {
        return (widget.fields as WidgetField[] | undefined)?.find(field => field.key === fieldKey)
    }, [widget.fields, fieldKey])

    const dispatch = useDispatch()

    const drilldown = useCallback(
        (recordId: string) => {
            dispatch(
                actions.userDrillDown({
                    widgetName: widget.name,
                    cursor: recordId,
                    bcName: widget.bcName,
                    fieldKey: fieldKey
                })
            )
        },
        [dispatch, widget.name, widget.bcName, fieldKey]
    )

    if (fieldMeta?.drillDown) {
        return { fieldMeta, drilldown }
    }

    return { fieldMeta }
}
