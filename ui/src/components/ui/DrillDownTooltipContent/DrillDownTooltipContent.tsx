import React from 'react'
import { t } from 'i18next'
import { Icon } from 'antd'
import styles from './DrillDownTooltipContent.module.less'

export interface DrillDownToolsProps {
    onDrillDownInNewTab: (e: React.MouseEvent<HTMLElement>) => void
    onCopyLink: (e: React.MouseEvent<HTMLElement>) => void
}

const DrillDownTooltipContent: React.FunctionComponent<DrillDownToolsProps> = ({ onDrillDownInNewTab, onCopyLink }) => {
    return (
        <div className={styles.container}>
            <Icon title={t('Open link in new tab')} type="export" onClick={onDrillDownInNewTab} />
            <Icon title={t('Copy link address')} type="copy" onClick={onCopyLink} />
        </div>
    )
}

export default React.memo(DrillDownTooltipContent)
