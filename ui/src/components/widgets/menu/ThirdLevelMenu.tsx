import React from 'react'
import ViewNavigation from '../../ViewNavigation/ViewNavigation'

function ThirdLevelMenu() {
    return <ViewNavigation depth={2} />
}

export default React.memo(ThirdLevelMenu)
