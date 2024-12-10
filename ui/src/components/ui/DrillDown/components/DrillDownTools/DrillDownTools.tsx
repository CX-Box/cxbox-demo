import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import DrillDownTooltipContent from '@components/ui/DrillDownTooltipContent/DrillDownTooltipContent'
import { drillDownInNewTab } from '@actions'
import copyTextToClipboard from '@utils/copyTextToClipboard'
import openInNewTab from '@utils/openInNewTab'
import { WidgetFieldBase } from '@cxbox-ui/schema'

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
                openInNewTab(fullUrl)
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

    return <DrillDownTooltipContent onDrillDownInNewTab={handleDrillDownInNewTab} onCopyLink={handleCopyLink} />
}

export default React.memo(DrillDownTools)
