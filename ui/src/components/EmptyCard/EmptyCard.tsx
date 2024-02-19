import React from 'react'
import { Col, Row } from 'antd'
import DebugWidgetWrapper from '../DebugWidgetWrapper/DebugWidgetWrapper'
import styles from './EmptyCard.module.css'
import { interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'

interface EmptyCardProps {
    children?: React.ReactNode
    meta: interfaces.WidgetMeta
}

function EmptyCard({ children, meta }: EmptyCardProps) {
    const debugMode = useAppSelector(state => state.session.debugMode || false)

    return (
        <Row
            className={styles.container}
            data-test="WIDGET"
            data-test-widget-type={meta.type}
            data-test-widget-position={meta.position}
            data-test-widget-title={meta.title}
            data-test-widget-name={meta.name}
            justify="center"
        >
            <Col span={24}>
                <DebugWidgetWrapper debugMode={debugMode} meta={meta}>
                    {children}
                </DebugWidgetWrapper>
            </Col>
        </Row>
    )
}

export default React.memo(EmptyCard)
