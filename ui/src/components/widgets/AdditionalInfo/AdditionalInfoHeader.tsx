import React from 'react'
import { Col, Row } from 'antd'
import styles from './AdditionalInfoHeader.module.css'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { WidgetMeta } from '@cxbox-ui/core'

interface Props {
    meta: WidgetMeta
    id?: string | null
    level?: 1 | 2
}

export const AdditionalInfoHeader: React.FC<Props> = ({ meta, id, level = 2 }) => {
    return meta.title ? (
        <Row gutter={[8, 18]}>
            <Col span={24}>
                <WidgetTitle
                    className={styles.title}
                    level={level}
                    widgetName={meta.name}
                    marginBottom={2}
                    text={meta.title}
                    id={id as string}
                />
            </Col>
        </Row>
    ) : null
}
