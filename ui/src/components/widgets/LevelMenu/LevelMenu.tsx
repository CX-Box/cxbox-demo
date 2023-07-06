import React from 'react'
import ViewNavigation from '../../ViewNavigation/ViewNavigation'
import { getNavigationDepth } from '../../../utils/getNavigationDepth'
import { WidgetMeta } from '@cxbox-ui/core/interfaces/widget'

interface LevelMenuProps {
    meta?: WidgetMeta
}

function LevelMenu({ meta }: LevelMenuProps) {
    const depth = getNavigationDepth(meta?.type)

    return <ViewNavigation depth={depth} />
}

export default React.memo(LevelMenu)
