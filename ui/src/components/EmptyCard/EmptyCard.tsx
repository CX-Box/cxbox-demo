import React from 'react'
import { Col, Row } from 'antd'
import { useSelector } from 'react-redux'
import { WidgetMeta } from '@cxbox-ui/core/interfaces/widget'
import DebugWidgetWrapper from '../DebugWidgetWrapper/DebugWidgetWrapper'
import { AppState } from '../../interfaces/storeSlices'
import styles from './EmptyCard.module.css'

interface EmptyCardProps {
    children?: React.ReactNode
    meta: WidgetMeta
}

function EmptyCard({ children, meta }: EmptyCardProps) {
    const debugMode = useSelector((state: AppState) => state.session.debugMode || false)

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
