import React from 'react'
import { Col, Row } from 'antd'
import InfoCell from './InfoCell'
import { interfaces, WidgetFieldBase } from '@cxbox-ui/core'
import { AppWidgetInfoMeta } from '@interfaces/widget'
import styles from './InfoRow.module.css'

export interface InfoRowProps {
    meta: AppWidgetInfoMeta
    flattenWidgetFields: WidgetFieldBase[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    row: interfaces.LayoutRow
    cursor: string
}
function InfoRow({ meta, flattenWidgetFields, onDrillDown, row, cursor }: InfoRowProps) {
    return (
        <Row className={styles.rowWrapper} type="flex" align="stretch">
            <Col span={24}>
                {row.cols.map((col, colIndex) => {
                    const field = flattenWidgetFields.find(i => i.key === col.fieldKey) as interfaces.WidgetInfoField
                    return (
                        <InfoCell
                            key={colIndex}
                            row={row}
                            colSpan={col.span || 0}
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
