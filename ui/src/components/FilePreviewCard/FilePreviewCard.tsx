import React, { useRef } from 'react'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import useFilePreviewRect from './hooks/useFilePreviewRect'
import { interfaces } from '@cxbox-ui/core'
import styles from './FilePreviewCard.module.css'

interface FilePreviewCardProps {
    children?: React.ReactNode
    meta: interfaces.WidgetMeta
}

function FilePreviewCard({ children, meta }: FilePreviewCardProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    const title = meta?.title

    const { isMainWidget, isCollapsed } = useWidgetCollapse(meta.name)

    const { width, top } = useFilePreviewRect(containerRef)

    return (
        <div
            ref={containerRef}
            data-test="WIDGET"
            data-test-widget-type={meta.type}
            data-test-widget-position={meta.position}
            data-test-widget-title={title}
            data-test-widget-name={meta.name}
        >
            <div className={styles.fixedContainer} style={{ width, height: `calc(100% - ${top}px)` }}>
                <WidgetTitle level={2} widgetName={meta.name} text={title} />

                {!(isMainWidget && isCollapsed) && children}
            </div>
        </div>
    )
}

export default React.memo(FilePreviewCard)
