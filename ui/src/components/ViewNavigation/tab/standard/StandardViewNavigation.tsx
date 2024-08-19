import React from 'react'
import { TabsProps } from 'antd/es/tabs'
import { ViewTabs } from '@components/ViewNavigation/ui/ViewTabs'
import { useContextStandardViewTabs } from '@components/ViewNavigation/tab/standard/hooks/useContextStandardViewTabs'

interface StandardViewNavigationProps extends Pick<TabsProps, 'type'> {
    depth?: number
}

export function StandardViewNavigation({ depth = 1, type }: StandardViewNavigationProps) {
    const { tabs, handleChange, activeKey } = useContextStandardViewTabs(depth)

    return <ViewTabs depth={depth} tabs={tabs} onChange={handleChange} activeKey={activeKey} type={type} />
}
