import React from 'react'
import InfoLabel from './InfoLabel'
import styles from './ViewInfoLabel.less'
import { useAppSelector } from '@store'

const ViewInfoLabel: React.FunctionComponent = () => {
    const screenName = useAppSelector(state => state.screen.screenName) ?? ''
    const viewName = useAppSelector(state => state.view.name) ?? ''
    const screenInfo = [`"name": "${screenName}"`]
    const viewInfo = [`"name": "${viewName}"`]
    return (
        <div className={styles.container}>
            <InfoLabel label="Screen" info={screenInfo} />
            <InfoLabel label="View" info={viewInfo} />
        </div>
    )
}

const MemoizedViewInfoLabel = React.memo(ViewInfoLabel)
export default MemoizedViewInfoLabel
