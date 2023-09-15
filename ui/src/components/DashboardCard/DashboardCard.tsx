import React from 'react'
import { Col, Row } from 'antd'
import { useSelector } from 'react-redux'
import { WidgetMeta } from '@cxbox-ui/core/interfaces/widget'
import { AppState } from '../../interfaces/storeSlices'
import DebugWidgetWrapper from '../DebugWidgetWrapper/DebugWidgetWrapper'
import styles from './DashboardCard.module.css'

interface DashboardCardProps {
    children?: React.ReactNode
    meta: WidgetMeta
}

function DashboardCard({ children, meta }: DashboardCardProps) {
    const title = meta?.title
    const debugMode = useSelector((state: AppState) => state.session.debugMode || false)

    return (
        <div
            className={styles.container}
            data-test="WIDGET"
            data-test-widget-type={meta.type}
            data-test-widget-position={meta.position}
            data-test-widget-title={title}
            data-test-widget-name={meta.name}
        >
            <Row justify="center">
                <Col span={24}>
                    <DebugWidgetWrapper debugMode={debugMode} meta={meta}>
                        {title && <h2 className={styles.header}>{title}</h2>}
                        {children}
                    </DebugWidgetWrapper>
                </Col>
            </Row>
        </div>
    )
}

export default React.memo(DashboardCard)
