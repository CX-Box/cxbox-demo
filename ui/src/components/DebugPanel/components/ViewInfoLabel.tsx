import React from 'react'
import cn from 'classnames'
import InfoLabel from './InfoLabel'
import RuntimeErrors from '@components/RuntimeErrors/RuntimeErrors'
import { useAppSelector } from '@store'
import { useRuntimeErrors } from '@hooks/useRuntimeErrors'
import styles from './ViewInfoLabel.less'

const ViewInfoLabel: React.FunctionComponent = () => {
    const screenName = useAppSelector(state => state.screen.screenName) ?? ''
    const viewName = useAppSelector(state => state.view.name) ?? ''
    const { level } = useRuntimeErrors({ viewOnly: true })
    const screenInfo = [`"name": "${screenName}"`]
    const viewInfo = [`"name": "${viewName}"`]

    return (
        <div className={styles.wrapper}>
            <div className={cn(styles.container, { [styles.problems]: level === 'error', [styles.warnings]: level === 'warning' })}>
                <InfoLabel label="Screen" info={screenInfo} />
                <InfoLabel label="View" info={viewInfo} />
                <RuntimeErrors viewOnly />
            </div>
        </div>
    )
}

export default React.memo(ViewInfoLabel)
