import React from 'react'
import ViewNavigation from '../../ViewNavigation/ViewNavigation'
import { AppWidgetMeta } from '../../../interfaces/widget'
import { getNavigationDepth } from '../../../utils/getNavigationDepth'

interface LevelMenuProps {
    meta?: AppWidgetMeta
}

function LevelMenu({ meta }: LevelMenuProps) {
    const depth = getNavigationDepth(meta?.type)

    return <ViewNavigation depth={depth} />
}

export default React.memo(LevelMenu)
