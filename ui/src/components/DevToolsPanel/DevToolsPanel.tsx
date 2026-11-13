import React from 'react'
import { Layout as AntLayout } from 'antd'
import styles from './DevToolsPanel.less'
import RefreshMetaButton from './components/RefreshMetaButton'
import DebugModeButton from './components/DebugModeButton'
import RuntimeErrors from '@components/RuntimeErrors/RuntimeErrors'
import cn from 'classnames'

interface DevToolsPanelProps {
    className?: string
    children?: React.ReactNode
}

/**
 * Dev tools panel
 */
const DevToolsPanel: React.FunctionComponent<DevToolsPanelProps> = ({ children, className }) => {
    return (
        <div className={cn(styles.container, className)}>
            <AntLayout.Header>
                <div className={styles.controlsWrapper}>
                    <RefreshMetaButton className={styles.wrapper} key="RefreshMetaButton" />
                    <DebugModeButton className={styles.wrapper} key="DebugModeButton" />
                    <RuntimeErrors className={styles.wrapper} key="RuntimeErrors" />
                    {children}
                </div>
            </AntLayout.Header>
        </div>
    )
}

export default React.memo(DevToolsPanel)
