import React, { useRef } from 'react'
import { Col, Row } from 'antd'
import DebugWidgetWrapper from '../DebugWidgetWrapper/DebugWidgetWrapper'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { useAppSelector } from '@store'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import useRefWidth from './hooks/useRefWidth'
import { interfaces } from '@cxbox-ui/core'
import styles from './FilePreviewCard.module.css'

interface FilePreviewCardProps {
    children?: React.ReactNode
    meta: interfaces.WidgetMeta
}

function FilePreviewCard({ children, meta }: FilePreviewCardProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const debugMode = useAppSelector(state => state.session.debugMode || false)
    const devPanelEnabled = useAppSelector(state => state.session.devPanelEnabled)
    const title = meta?.title

    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)

    const filePreviewWidth = useRefWidth(containerRef)

    return (
        <div
            ref={containerRef}
            data-test="WIDGET"
            data-test-widget-type={meta.type}
            data-test-widget-position={meta.position}
            data-test-widget-title={title}
            data-test-widget-name={meta.name}
        >
            <Row justify="center">
                <Col span={24}>
                    <div
                        className={styles.fixedContainer}
                        style={{ width: filePreviewWidth, height: `calc(100vh - ${devPanelEnabled ? '42px' : '12px'})` }}
                    >
                        <DebugWidgetWrapper debugMode={debugMode} meta={meta}>
                            <WidgetTitle className={styles.header} level={2} widgetName={meta.name} text={title} />

                            {!(isMainWidget && isCollapsed) && children}
                        </DebugWidgetWrapper>
                    </div>
                </Col>
            </Row>
        </div>
    )
}

export default React.memo(FilePreviewCard)
