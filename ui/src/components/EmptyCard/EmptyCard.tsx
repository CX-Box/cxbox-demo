import React from 'react'
import { Col, Row } from 'antd'
import styles from './EmptyCard.module.css'
import { WidgetMeta } from '@cxbox-ui/core'

interface EmptyCardProps {
    children?: React.ReactNode
    meta: WidgetMeta
}

function EmptyCard({ children, meta }: EmptyCardProps) {
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
            <Col span={24}>{children}</Col>
        </Row>
    )
}

export default React.memo(EmptyCard)
