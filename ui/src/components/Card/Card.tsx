import React from 'react'
import { buildBcUrl, TemplatedTitle } from '@cxbox-ui/core'
import { WidgetMeta, WidgetTypes } from '@cxbox-ui/core/interfaces/widget'
import { Col, Row } from 'antd'
import Operations from '../Operations/Operations'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import styles from './Card.module.css'
import cn from 'classnames'

export interface CardProps {
    children: React.ReactNode
    meta: WidgetMeta
    className?: string
}
const showOperations = [WidgetTypes.List, WidgetTypes.DataGrid, WidgetTypes.Form]

function Card({ meta, children, className }: CardProps) {
    const { type, bcName } = meta
    const bcUrl = useSelector((state: AppState) => state.screen.bo.bc[bcName] && buildBcUrl(bcName, true))
    const operations = useSelector((state: AppState) => state.view.rowMeta?.[bcName]?.[bcUrl]?.actions)

    return (
        <Row justify="center">
            <Col span={22} offset={1}>
                <div className={cn(styles.container, className)}>
                    {meta.title && (
                        <h2 className={styles.widgetTitle}>
                            <TemplatedTitle widgetName={meta.name} title={meta.title} />
                        </h2>
                    )}
                    {type === WidgetTypes.Form && children}
                    {showOperations.includes(type as WidgetTypes) && (
                        <Operations operations={operations} bcName={bcName} widgetMeta={meta} />
                    )}
                    {type !== WidgetTypes.Form && children}
                </div>
            </Col>
        </Row>
    )
}

export default React.memo(Card)
