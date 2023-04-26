import React from 'react'
import { Col, Row } from 'antd'
import styles from './DashboardCard.module.css'

interface DashboardCardProps {
    children?: React.ReactNode
}

function DashboardCard({ children }: DashboardCardProps) {
    return (
        <div className={styles.container}>
            <Row justify="center">
                <Col span={22} offset={1}>
                    <h2 className={styles.header}>{(children as any)?.props?.meta?.title}</h2>
                    {children}
                </Col>
            </Row>
        </div>
    )
}

export default React.memo(DashboardCard)
