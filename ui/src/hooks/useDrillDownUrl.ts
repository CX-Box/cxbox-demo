import { interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'

/**
 * @param bcName - bcName passed to field
 * @param cursor - field ID
 * @param fieldMeta - widget field meta
 * @description Allows to override drilldown url from field data by drillDownKey. Checking order allows to disable
 * drilldown link, for example if object is removed.
 * @category Hooks
 */
export function useDrillDownUrl(bcName: string, fieldMeta: interfaces.WidgetFieldBase, cursor: string): string | null {
    const drillDownLink = useAppSelector(state => {
        if (!fieldMeta.drillDown) {
            return null
        }
        const record = state.data[bcName]?.find(dataItem => dataItem.id === cursor)
        const bcUrl = buildBcUrl(bcName, true)
        const rowMeta = bcUrl && state.view.rowMeta[bcName]?.[bcUrl]
        if (!rowMeta || !rowMeta.fields) {
            return null
        }
        const rowFieldMeta = rowMeta.fields?.find(field => field.key === fieldMeta.key)
        return (record?.[fieldMeta?.drillDownKey as string] as string) || rowFieldMeta?.drillDown || null
    })
    return drillDownLink
}
