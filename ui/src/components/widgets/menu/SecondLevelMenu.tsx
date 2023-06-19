import React from 'react'
import ViewNavigation from '../../ViewNavigation/ViewNavigation'

function SecondLevelMenu() {
    return <ViewNavigation depth={1} />
}

export default React.memo(SecondLevelMenu)
