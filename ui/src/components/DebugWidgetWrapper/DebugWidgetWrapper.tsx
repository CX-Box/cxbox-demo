import React, { FC } from 'react'
import DebugPanel from '../DebugPanel/DebugPanel'
import styles from './DebugWidgetWrapper.less'
import { interfaces } from '@cxbox-ui/core'

interface Props {
    children?: React.ReactNode
    debugMode: boolean
    meta: interfaces.WidgetMeta | interfaces.WidgetMetaAny
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
