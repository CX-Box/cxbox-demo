import React from 'react'
import { Col, Row } from 'antd'
import styles from './DashboardCard.module.css'

interface DashboardCardProps {
    children?: React.ReactNode
}

function DashboardCard({ children }: DashboardCardProps) {
    const title = (children as any)?.props?.meta?.title
    return (
        <div className={styles.container}>
            <Row justify="center">
                <Col span={24}>
                    {title && <h2 className={styles.header}>{title}</h2>}
                    {children}
                </Col>
            </Row>
        </div>
    )
}

export default React.memo(DashboardCard)
