import React from 'react'
import InfoLabel from './InfoLabel'
import { useAppSelector } from '@store'
import styles from './ViewInfoLabel.less'
import { useBcLocation } from '@hooks/useBcLocation'
import { useScreenMeta, useViewMeta } from '../../../hooks/queries'

const ViewInfoLabel: React.FunctionComponent = () => {
    const [location] = useBcLocation()
    const { data: screenMeta } = useScreenMeta(location.bcMap.get('screen'))
    const { data: viewMeta } = useViewMeta(location.bcMap.get('screen'), location.bcMap.get('view'))
    const screenInfo = [`"name": "${screenMeta?.name}"`]
    const viewInfo = [`"name": "${viewMeta?.name}"`]

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
