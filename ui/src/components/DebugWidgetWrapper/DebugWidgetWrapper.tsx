import React, { FC } from 'react'
import cn from 'classnames'
import DebugPanel from '../DebugPanel/DebugPanel'
import { WidgetMeta, WidgetMetaAny } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import styles from './DebugWidgetWrapper.less'

interface Props {
    children?: React.ReactNode
    meta: WidgetMeta | WidgetMetaAny
}

const DebugWidgetWrapper: FC<Props> = ({ children, meta }) => {
    const debugMode = useAppSelector(state => state.session.debugMode || false)

    return (
        <div
            className={cn({
                [styles.debugWidgetWrapper]: debugMode
            })}
        >
            {debugMode && (
                <div className={styles.debugPanelWrapper}>
                    <DebugPanel className={styles.debugPanel} widgetMeta={meta} />
                </div>
            )}

            <div
                className={cn({
                    [styles.widget]: debugMode
                })}
            >
                {children}
            </div>
        </div>
    )
}

export default DebugWidgetWrapper
