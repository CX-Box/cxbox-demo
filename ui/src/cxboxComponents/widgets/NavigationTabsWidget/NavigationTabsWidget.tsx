import React from 'react'
import NavigationTabs from '@cxboxComponents/ui/NavigationTabs/NavigationTabs'
import { interfaces } from '@cxbox-ui/core'

export interface NavigationTabsWidgetProps {
    meta: interfaces.NavigationWidgetMeta
}

function NavigationTabsWidget({ meta }: NavigationTabsWidgetProps) {
    return <NavigationTabs navigationLevel={meta.options?.navigationLevel ?? 1} />
}

export default React.memo(NavigationTabsWidget)
