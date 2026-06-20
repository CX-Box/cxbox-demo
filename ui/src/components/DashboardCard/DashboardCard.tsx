import React from 'react'
import { Col, Row } from 'antd'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import styles from './DashboardCard.module.css'
import { WidgetComponentType } from '@features/Widget'

const DashboardCard: WidgetComponentType = ({ children, widgetMeta, mode }) => {
    const title = widgetMeta?.title

    const { isMainWidget, isCollapsed } = useWidgetCollapse(widgetMeta.name)

    if (mode === 'skip_card' || mode === 'headless') {
        return <>{children}</>
    }

    return (
        <div
            className={styles.container}
            data-test="WIDGET"
            data-test-widget-type={widgetMeta.type}
            data-test-widget-position={widgetMeta.position}
            data-test-widget-title={title}
            data-test-widget-name={widgetMeta.name}
        >
            <Row justify="center">
                <Col span={24}>
                    <WidgetTitle className={styles.header} level={2} widgetName={widgetMeta.name} text={title} />
                    {!(isMainWidget && isCollapsed) && children}
                </Col>
            </Row>
        </div>
    )
}

export default React.memo(DashboardCard)
