import React, { FC } from 'react'
import DebugPanel from '../DebugPanel/DebugPanel'
import styles from './DebugWidgetWrapper.less'
import { WidgetMeta, WidgetMetaAny } from '@cxbox-ui/core'
import { useAppSelector } from '@store'

interface Props {
    children?: React.ReactNode
    meta: WidgetMeta | WidgetMetaAny
}

const DebugWidgetWrapper: FC<Props> = ({ children, meta }) => {
    const debugMode = useAppSelector(state => state.session.debugMode || false)

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
