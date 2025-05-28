import React, { useMemo } from 'react'
import { Popover } from 'antd'
import ActionLink from '@components/ui/ActionLink/ActionLink'
import DrillDownTools from './components/DrillDownTools/DrillDownTools'
import { useAppSelector } from '@store'
import getFullUrl from '@utils/getFullUrl'
import { EFeatureSettingKey } from '@interfaces/session'
import { EDrillDownTooltipValue } from './constants'
import { WidgetFieldBase } from '@cxbox-ui/schema'
import { DrillDownType } from '@cxbox-ui/core'

export interface DrillDownProps {
    displayedValue?: React.ReactNode
    widgetName?: string
    cursor?: string
    meta?: WidgetFieldBase
    url?: string
    type?: DrillDownType
    drillDownComponent?: React.ReactNode
    onDrillDown: () => void
}

const DrillDown: React.FC<DrillDownProps> = ({ displayedValue, widgetName, cursor, meta, url, type, drillDownComponent, onDrillDown }) => {
    const drillDownTooltip = useAppSelector(state =>
        state.session.featureSettings?.find(featureSetting => featureSetting.key === EFeatureSettingKey.drillDownTooltip)
    )

    const drillDownLink = useMemo(
        () => drillDownComponent || <ActionLink onClick={onDrillDown}>{displayedValue}</ActionLink>,
        [displayedValue, drillDownComponent, onDrillDown]
    )

    return (
        <>
            {drillDownTooltip?.value === EDrillDownTooltipValue.newAndCopy ? (
                <Popover
                    content={<DrillDownTools cursor={cursor} widgetName={widgetName} meta={meta} fullUrl={url && getFullUrl(url, type)} />}
                    placement="top"
                >
                    <span>{drillDownLink}</span>
                </Popover>
            ) : (
                drillDownLink
            )}
        </>
    )
}

export default DrillDown
