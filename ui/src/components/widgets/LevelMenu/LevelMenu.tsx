import React from 'react'
import ViewNavigation from '../../ViewNavigation/ViewNavigation'
import WidgetTitle from '@components/WidgetTitle/WidgetTitle'
import { getNavigationDepth } from '@utils/getNavigationDepth'
import { useWidgetCollapse } from '@hooks/useWidgetCollapse'
import { interfaces } from '@cxbox-ui/core'

interface LevelMenuProps {
    meta?: interfaces.WidgetMeta
}

function LevelMenu({ meta }: LevelMenuProps) {
    const depth = getNavigationDepth(meta?.type)
    const widgetName = meta?.name || ''

    const { isMainWidget, isCollapsed } = useWidgetCollapse(widgetName)

    return (
        <>
            {isMainWidget && <WidgetTitle level={2} widgetName={widgetName} text={meta?.title} />}
            {!(isMainWidget && isCollapsed) && <ViewNavigation depth={depth} />}
        </>
    )
}

export default React.memo(LevelMenu)
