import React, { FC } from 'react'
import { WidgetMeta, WidgetMetaAny } from '@cxbox-ui/core/interfaces/widget'
import DebugPanel from '../DebugPanel/DebugPanel'
import styles from './DebugWidgetWrapper.less'

interface Props {
    children?: React.ReactNode
    debugMode: boolean
    meta: WidgetMeta | WidgetMetaAny
}

const DebugWidgetWrapper: FC<Props> = props => {
    const { children, debugMode, meta } = props

    return debugMode ? (
        <div className={styles.debugWidgetWrapper}>
            <div className={styles.debugWidget}>
                <div className={styles.debugPanelWrapper}>
                    <DebugPanel className={styles.debugPanel} widgetMeta={meta} />
                </div>
                <div className={styles.widget}>{children}</div>
            </div>
        </div>
    ) : (
        <>{children}</>
    )
}

export default DebugWidgetWrapper
