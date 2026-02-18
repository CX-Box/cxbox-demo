import React from 'react'
import InfoLabel from './InfoLabel'
import { useAppSelector } from '@store'
import styles from './ViewInfoLabel.module.less'

const ViewInfoLabel: React.FunctionComponent = () => {
    const screenName = useAppSelector(state => state.screen.screenName) ?? ''
    const viewName = useAppSelector(state => state.view.name) ?? ''
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

export default React.memo(ViewInfoLabel)
