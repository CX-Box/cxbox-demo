import React from 'react'
import { Col, Row } from 'antd'
import styles from './EmptyCard.module.css'
import { WidgetComponentType } from '@features/Widget'

const EmptyCard: WidgetComponentType = ({ children, widgetMeta, mode }) => {
    if (mode === 'headless' || mode === 'skip_card') {
        return <>{children}</>
    }
    return (
        <Row
            className={styles.container}
            data-test="WIDGET"
            data-test-widget-type={widgetMeta.type}
            data-test-widget-position={widgetMeta.position}
            data-test-widget-title={widgetMeta.title}
            data-test-widget-name={widgetMeta.name}
            justify="center"
        >
            <Col span={24}>{children}</Col>
        </Row>
    )
}

export default React.memo(EmptyCard)
