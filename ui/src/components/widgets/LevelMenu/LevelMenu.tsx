import React from 'react'
import ViewNavigation from '../../ViewNavigation/ViewNavigation'
import { getNavigationDepth } from '@utils/getNavigationDepth'
import { interfaces } from '@cxbox-ui/core'

interface LevelMenuProps {
    meta?: interfaces.WidgetMeta
}

function LevelMenu({ meta }: LevelMenuProps) {
    const depth = getNavigationDepth(meta?.type)

    return <ViewNavigation depth={depth} />
}

export default React.memo(LevelMenu)
