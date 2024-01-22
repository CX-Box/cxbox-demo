import React from 'react'
import { Col, Row } from 'antd'
import styles from './InfoRow.less'
import cn from 'classnames'
import InfoCell from './InfoCell'
import { interfaces } from '@cxbox-ui/core'

export interface InfoRowProps {
    meta: interfaces.WidgetInfoMeta
    data: interfaces.DataItem
    flattenWidgetFields: interfaces.WidgetInfoField[]
    fields: interfaces.RowMetaField[]
    onDrillDown: (widgetName: string, cursor: string, bcName: string, fieldKey: string) => void
    row: interfaces.LayoutRow
    cursor: string
    index: number
}
const InfoRow: React.FunctionComponent<InfoRowProps> = props => {
    const totalWidth = props.row.cols.reduce((prev, current) => prev + (current.span as number), 0)
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
