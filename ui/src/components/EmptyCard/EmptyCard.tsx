import React from 'react'
import { Col, Row } from 'antd'
import styles from './EmptyCard.module.css'

interface EmptyCardProps {
    children?: React.ReactNode
}

function EmptyCard({ children }: EmptyCardProps) {
    return (
        <Row justify="center" className={styles.container}>
            <Col span={24}>{children}</Col>
        </Row>
    )
}

export default React.memo(EmptyCard)
