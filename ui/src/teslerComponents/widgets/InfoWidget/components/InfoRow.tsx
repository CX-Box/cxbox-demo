import React from 'react'
import { Col, Row } from 'antd'
import styles from './InfoRow.less'
import cn from 'classnames'
import InfoCell from './InfoCell'
import { LayoutRow, WidgetInfoField, WidgetInfoMeta } from '@tesler-ui/core'
import { DataItem } from '@tesler-ui/core'
import { RowMetaField } from '@tesler-ui/core'

export interface InfoRowProps {
    meta: WidgetInfoMeta
    data: DataItem
    flattenWidgetFields: WidgetInfoField[]
    fields: RowMetaField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    row: LayoutRow
    cursor: string
    index: number
}
const InfoRow: React.FunctionComponent<InfoRowProps> = props => {
    const totalWidth = props.row.cols.reduce((prev, current) => prev + current.span, 0)
    return (
        <Row className={styles.rowWrapper}>
            <Col span={24} className={cn({ [styles.extraWidth]: totalWidth > 24 })}>
                {props.row.cols
                    .filter(field => {
                        const meta = props.fields?.find(item => item.key === field.fieldKey)
                        return meta ? !meta.hidden : true
                    })
                    .map((col, colIndex) => {
                        return (
                            <InfoCell
                                key={colIndex}
                                row={props.row}
                                col={col}
                                cursor={props.cursor}
                                meta={props.meta}
                                data={props.data}
                                flattenWidgetFields={props.flattenWidgetFields}
                                onDrillDown={props.onDrillDown}
                            />
                        )
                    })}
            </Col>
        </Row>
    )
}

export default React.memo(InfoRow)
