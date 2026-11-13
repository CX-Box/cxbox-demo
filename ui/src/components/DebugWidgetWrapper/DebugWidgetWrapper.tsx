import React, { FC } from 'react'
import cn from 'classnames'
import DebugPanel from '../DebugPanel/DebugPanel'
import { WidgetMeta, WidgetMetaAny } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import { useRuntimeErrors } from '@hooks/useRuntimeErrors'
import styles from './DebugWidgetWrapper.less'

interface Props {
    className?: string
    children?: React.ReactNode
    meta: WidgetMeta | WidgetMetaAny
}

const DebugWidgetWrapper: FC<Props> = ({ className, children, meta }) => {
    const debugMode = useAppSelector(state => state.session.debugMode || false)
    const { level } = useRuntimeErrors({ widget: meta.name })

    return (
        <div
            className={cn(className, {
                [styles.debugWidgetWrapper]: debugMode,
                [styles.problems]: debugMode && level === 'error',
                [styles.warnings]: debugMode && level === 'warning'
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
