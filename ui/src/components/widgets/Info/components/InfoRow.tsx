import React, { useCallback } from 'react'
import { Col, Row } from 'antd'
import styles from './InfoRow.module.css'
import cn from 'classnames'
import InfoCell from './InfoCell'
import { useAppSelector } from '@store'
import { EMPTY_ARRAY } from '@constants'
import { interfaces } from '@cxbox-ui/core'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AppWidgetInfoMeta } from '@interfaces/widget'

const MAX_COL_SPAN = 24

export interface InfoRowProps {
    meta: AppWidgetInfoMeta
    flattenWidgetFields: interfaces.WidgetInfoField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    row: interfaces.LayoutRow
    cursor: string
}
function InfoRow({ meta, flattenWidgetFields, onDrillDown, row, cursor }: InfoRowProps) {
    const bcUrl = buildBcUrl(meta.bcName, true)
    const fields = useAppSelector(state =>
        bcUrl ? state.view.rowMeta[meta.bcName]?.[bcUrl]?.fields : (EMPTY_ARRAY as interfaces.RowMetaField[])
    )
    const visibleColumns = row.cols.filter(field => {
        const fieldMeta = fields?.find(item => item.key === field.fieldKey)
        return fieldMeta ? !fieldMeta.hidden : true
    })
    const totalWidth = visibleColumns.reduce((prev, current) => prev + (current.span ?? 0), 0)
    const totalColumnWidthExceedsMaximum = totalWidth > MAX_COL_SPAN
    const calculateColSpan = useCallback(
        (colSpan: number) => {
            const proportionalityFactor = MAX_COL_SPAN / totalWidth

            return proportionalityFactor < 1 ? proportionalityFactor * colSpan : colSpan
        },
        [totalWidth]
    )

    return (
        <Row className={styles.rowWrapper}>
            <Col span={24} className={cn({ [styles.extraWidth]: totalColumnWidthExceedsMaximum })}>
                {visibleColumns.map((col, colIndex) => {
                    const field = flattenWidgetFields.find(i => i.key === col.fieldKey) as interfaces.WidgetInfoField
                    return (
                        <InfoCell
                            key={colIndex}
                            row={row}
                            colSpan={calculateColSpan(col.span ?? 0)}
                            cursor={cursor}
                            meta={meta}
                            field={field}
                            onDrillDown={onDrillDown}
                        />
                    )
                })}
            </Col>
        </Row>
    )
}

export default React.memo(InfoRow)
