import React, { useRef } from 'react'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import useFilePreviewRect from './hooks/useFilePreviewRect'
import styles from './FilePreviewCard.module.css'
import { WidgetComponentType } from '@features/Widget'

const FilePreviewCard: WidgetComponentType = ({ children, widgetMeta, mode }) => {
    const containerRef = useRef<HTMLDivElement>(null)

    const title = widgetMeta?.title

    const { isMainWidget, isCollapsed } = useWidgetCollapse(widgetMeta.name)

    const { width, top } = useFilePreviewRect(containerRef)

    if (mode === 'skip_card' || mode === 'headless') {
        return <>{children}</>
    }

    return (
        <div
            ref={containerRef}
            data-test="WIDGET"
            data-test-widget-type={widgetMeta.type}
            data-test-widget-position={widgetMeta.position}
            data-test-widget-title={title}
            data-test-widget-name={widgetMeta.name}
        >
            <div className={styles.fixedContainer} style={{ width, height: `calc(100% - ${top}px)` }}>
                <WidgetTitle level={2} widgetName={widgetMeta.name} text={title} />

                {!(isMainWidget && isCollapsed) && children}
            </div>
        </div>
    )
}

export default React.memo(FilePreviewCard)
