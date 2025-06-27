import React from 'react'
import { Col, Row } from 'antd'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { WidgetMeta } from '@cxbox-ui/core'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import styles from './DashboardCard.module.css'

interface DashboardCardProps {
    children?: React.ReactNode
    meta: WidgetMeta
}

function DashboardCard({ children, meta }: DashboardCardProps) {
    const title = meta?.title

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
                    <WidgetTitle className={styles.header} level={2} widgetName={meta.name} text={title} />
                    {!(isMainWidget && isCollapsed) && children}
                </Col>
            </Row>
        </div>
    )
}

export default React.memo(DashboardCard)
