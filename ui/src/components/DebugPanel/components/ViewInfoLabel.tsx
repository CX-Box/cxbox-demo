import React from 'react'
import { useSelector } from 'react-redux'
import InfoLabel from './InfoLabel'
import { AppState } from '../../../interfaces/storeSlices'
import styles from './ViewInfoLabel.less'

const ViewInfoLabel: React.FunctionComponent = () => {
    const screenName = useSelector((store: AppState) => store.screen.screenName) ?? ''
    const viewName = useSelector((store: AppState) => store.view.name) ?? ''
    const screenInfo = [`"name": "${screenName}"`]
    const viewInfo = [`"name": "${viewName}"`]

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <InfoLabel label="Screen" info={screenInfo} />
                <InfoLabel label="View" info={viewInfo} />
            </div>
        </div>
    )
}

const MemoizedViewInfoLabel = React.memo(ViewInfoLabel)
export default MemoizedViewInfoLabel
