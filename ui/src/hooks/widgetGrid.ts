import { isWidgetFieldBlock, LayoutCol, LayoutRow, WidgetFieldBase, WidgetFieldsOrBlocks } from '@cxbox-ui/core'
import { useCallback, useMemo } from 'react'
import { AppWidgetMeta } from '@interfaces/widget'
import { useAppSelector } from '@store'
import { selectBcUrlRowMeta } from '@selectors/selectors'
import { isHiddenFieldByMeta, isHiddenFieldByRowMeta } from '@utils/widgetGrid'

const MAX_COL_SPAN = 24

export const useProportionalWidgetCols = () => {
    const getTotalWidth = useCallback((cols: LayoutCol[]) => {
        return cols.reduce((prev, current) => prev + +(current.span ?? 0), 0)
    }, [])

    const calculateColSpan = useCallback(
        (colSpan: number | string | undefined, cols: LayoutCol[]) => {
            if (typeof colSpan !== 'number' && typeof colSpan !== 'string') {
                return colSpan
            }

            const totalWidth = getTotalWidth(cols)

            const proportionalityFactor = MAX_COL_SPAN / totalWidth

            return proportionalityFactor < 1 ? Math.floor(proportionalityFactor * +colSpan) : +colSpan
        },
        [getTotalWidth]
    )

    return { calculateColSpan }
}

export const useVisibleFlattenWidgetFields = <
    T extends Omit<AppWidgetMeta, 'fields' | 'type'> & { fields: WidgetFieldsOrBlocks<WidgetFieldBase> }
>(
    meta: T
) => {
    const rowMetaFields = useAppSelector(state => selectBcUrlRowMeta(state, meta.bcName, true)?.fields)

    return useMemo(() => {
        return meta.fields
            .flatMap(field => {
                if (isWidgetFieldBlock(field)) {
                    return field.fields
                } else {
                    return field
                }
            })
            .filter(fieldMeta => {
                return !isHiddenFieldByMeta(fieldMeta) && !isHiddenFieldByRowMeta(fieldMeta.key, rowMetaFields)
            })
    }, [meta.fields, rowMetaFields])
}

export const useProportionalWidgetGrid = <
    T extends Omit<AppWidgetMeta, 'fields' | 'type'> & { fields: WidgetFieldsOrBlocks<WidgetFieldBase> }
>(
    meta: T
) => {
    const visibleFlattenWidgetFields = useVisibleFlattenWidgetFields(meta)
    const rows = meta.options?.layout?.rows
    const { calculateColSpan } = useProportionalWidgetCols()

    const filterVisibleItemsOnGrid = useCallback(
        (rows: LayoutRow[]) => {
            return rows
                .map(row => {
                    const visibleColumns = row.cols.filter(col => {
                        return visibleFlattenWidgetFields.some(visibleWidgetField => visibleWidgetField.key === col.fieldKey)
                    })
                    return {
                        cols: visibleColumns.map(col => ({ ...col, span: calculateColSpan(col.span, visibleColumns) }))
                    }
                })
                .filter(row => row.cols.length > 0)
        },
        [calculateColSpan, visibleFlattenWidgetFields]
    )

    const grid = useMemo(() => {
        return rows ? filterVisibleItemsOnGrid(rows) : undefined
    }, [filterVisibleItemsOnGrid, rows])

    return { grid, visibleFlattenWidgetFields }
}
