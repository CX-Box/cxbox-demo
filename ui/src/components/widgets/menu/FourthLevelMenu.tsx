import React from 'react'
import ViewNavigation from '../../ViewNavigation/ViewNavigation'

function FourthLevelMenu() {
    return <ViewNavigation depth={3} />
}

export default React.memo(FourthLevelMenu)
