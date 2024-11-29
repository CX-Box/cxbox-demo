import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Icon } from 'antd'
import { drillDownInNewTab } from '@actions'
import copyTextToClipboard from '@utils/copyTextToClipboard'
import { WidgetFieldBase } from '@cxbox-ui/schema'
import styles from './DrillDownTools.less'

export interface DrillDownToolsProps {
    widgetName?: string
    meta?: WidgetFieldBase
    cursor?: string
    fullUrl?: string | null
}

const DrillDownTools: React.FunctionComponent<DrillDownToolsProps> = ({ meta, cursor, widgetName, fullUrl }) => {
    const dispatch = useDispatch()

    const { t } = useTranslation()

    const handleDrillDownInNewTab = useCallback(
        (e: React.MouseEvent<HTMLElement>, copyLink?: boolean) => {
            e.stopPropagation()

            if (fullUrl) {
                window.open(fullUrl, '_blank')
            } else {
                if (widgetName && cursor && meta?.key) {
                    dispatch(drillDownInNewTab({ widgetName, cursor, fieldKey: meta.key, copyLink }))
                }
            }
        },
        [cursor, dispatch, fullUrl, meta?.key, widgetName]
    )

    const handleCopyLink = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()

            if (fullUrl) {
                copyTextToClipboard(fullUrl, t('Link copied successfully'))
            } else {
                handleDrillDownInNewTab(e, true)
            }
        },
        [fullUrl, handleDrillDownInNewTab, t]
    )

    return (
        <div className={styles.container}>
            <Icon title={t('Open link in new tab')} type="export" onClick={handleDrillDownInNewTab} />
            <Icon title={t('Copy link address')} type="copy" onClick={handleCopyLink} />
        </div>
    )
}

export default React.memo(DrillDownTools)
