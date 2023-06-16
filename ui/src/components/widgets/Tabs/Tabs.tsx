import React from 'react'
import ViewNavigation from '../../ViewNavigation/ViewNavigation'
import { AppWidgetMeta } from '../../../interfaces/widget'

interface TabsProps {
    meta: AppWidgetMeta
}

function Tabs({ meta }: TabsProps) {
    return <ViewNavigation depth={meta.options?.navigationLevel} />
}

export default React.memo(Tabs)
