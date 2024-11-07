import React from 'react'
import { Col, Row } from 'antd'
import DebugWidgetWrapper from '../DebugWidgetWrapper/DebugWidgetWrapper'
import { useAppSelector } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { interfaces } from '@cxbox-ui/core'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import styles from './DashboardCard.module.css'

interface DashboardCardProps {
    children?: React.ReactNode
    meta: interfaces.WidgetMeta
}

function DashboardCard({ children, meta }: DashboardCardProps) {
    const title = meta?.title
    const debugMode = useAppSelector(state => state.session.debugMode || false)

    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)

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
                        <WidgetTitle className={styles.header} level={2} widgetName={meta.name} text={title} />
                        {!(isMainWidget && isCollapsed) && children}
                    </DebugWidgetWrapper>
                </Col>
            </Row>
        </div>
    )
}

export default React.memo(DashboardCard)
