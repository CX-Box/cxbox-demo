import React from 'react'
import DebugPanel from '../DebugPanel'
import styles from './PopupWidgetInfoLabel.less'
import { interfaces } from '@cxbox-ui/core'

interface Props {
    meta: interfaces.WidgetMeta
}

const PopupWidgetInfoLabel: React.FC<Props> = props => {
    const { meta } = props

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <DebugPanel widgetMeta={meta} />
            </div>
        </div>
    )
}

export default React.memo(PopupWidgetInfoLabel)
