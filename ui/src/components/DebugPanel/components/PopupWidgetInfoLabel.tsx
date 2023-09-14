import React from 'react'
import { WidgetMeta } from '@cxbox-ui/core/interfaces/widget'
import DebugPanel from '../DebugPanel'
import styles from './PopupWidgetInfoLabel.less'

interface Props {
    meta: WidgetMeta
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
