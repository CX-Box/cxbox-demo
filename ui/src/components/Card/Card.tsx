import React from 'react'
import { Col, Row } from 'antd'
import cn from 'classnames'
import { interfaces } from '@cxbox-ui/core'
import Operations from '../Operations/Operations'
import DebugWidgetWrapper from '../DebugWidgetWrapper/DebugWidgetWrapper'
import styles from './Card.less'
import { useAppSelector } from '@store'
import { TemplatedTitle } from '@cxboxComponents'
import { buildBcUrl } from '@utils/buildBcUrl'

export interface CardProps {
    children: React.ReactNode
    meta: interfaces.WidgetMeta
    className?: string
}

const { WidgetTypes } = interfaces

const showOperations = [WidgetTypes.List, WidgetTypes.DataGrid, WidgetTypes.Form]

function Card({ meta, children, className }: CardProps) {
    const { type, bcName } = meta
    const bcUrl = useAppSelector(state => state.screen.bo.bc[bcName] && buildBcUrl(bcName, true))
    const operations = useAppSelector(state => state.view.rowMeta?.[bcName]?.[bcUrl]?.actions)
    const debugMode = useAppSelector(state => state.session.debugMode || false)
    const isForm = type === WidgetTypes.Form

    return (
        <Row justify="center">
            <Col span={24}>
                <DebugWidgetWrapper debugMode={debugMode} meta={meta}>
                    <div
                        className={cn(styles.container, className)}
                        data-test="WIDGET"
                        data-test-widget-type={meta.type}
                        data-test-widget-position={meta.position}
                        data-test-widget-title={meta.title}
                        data-test-widget-name={meta.name}
                    >
                        {meta.title && (
                            <h2 className={styles.widgetTitle}>
                                <TemplatedTitle widgetName={meta.name} title={meta.title} />
                            </h2>
                        )}
                        {isForm && children}
                        {showOperations.includes(type as interfaces.WidgetTypes) && (
                            <Operations
                                operations={operations}
                                bcName={bcName}
                                widgetMeta={meta}
                                className={cn({
                                    [styles.operations]: !isForm
                                })}
                            />
                        )}
                        {!isForm && children}
                    </div>
                </DebugWidgetWrapper>
            </Col>
        </Row>
    )
}

export default React.memo(Card)
