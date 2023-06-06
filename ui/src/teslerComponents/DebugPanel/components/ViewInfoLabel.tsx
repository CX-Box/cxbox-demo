import React from 'react'
import InfoLabel from './InfoLabel'
import { useSelector } from 'react-redux'
import { Store } from '@interfaces/store'
import styles from './ViewInfoLabel.less'

const ViewInfoLabel: React.FunctionComponent = () => {
    const screenName = useSelector((store: Store) => store.screen.screenName) ?? ''
    const viewName = useSelector((store: Store) => store.view.name) ?? ''
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
