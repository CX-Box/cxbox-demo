import React from 'react'
import { Popover } from 'antd'
import { t } from 'i18next'
import DrillDownTooltipContent from '@components/ui/DrillDownTooltipContent/DrillDownTooltipContent'
import { DrillDownType } from '@cxbox-ui/core'
import copyTextToClipboard from '@utils/copyTextToClipboard'
import openInNewTab from '@utils/openInNewTab'
import getFullUrl from '@utils/getFullUrl'

export interface SocketNotificationDrillDownProps {
    url?: string
    type?: DrillDownType
    drillDownComponent?: React.ReactNode
    drillDownTooltipEnabled?: boolean
}

const SocketNotificationDrillDown: React.FC<SocketNotificationDrillDownProps> = ({
    url,
    type,
    drillDownComponent,
    drillDownTooltipEnabled
}) => {
    const fullUrl = getFullUrl(url, type)

    const handleDrillDownInNewTab = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()

        if (fullUrl) {
            openInNewTab(fullUrl)
        }
    }

    const handleCopyLink = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation()

        if (fullUrl) {
            copyTextToClipboard(fullUrl, t('Link copied successfully'))
        }
    }

    return (
        <>
            {drillDownTooltipEnabled ? (
                <Popover
                    content={<DrillDownTooltipContent onDrillDownInNewTab={handleDrillDownInNewTab} onCopyLink={handleCopyLink} />}
                    placement="top"
                >
                    <span>{drillDownComponent}</span>
                </Popover>
            ) : (
                drillDownComponent
            )}
        </>
    )
}

export default SocketNotificationDrillDown
