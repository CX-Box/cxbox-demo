import { memo } from 'react'
import { WidgetMeta } from '@cxbox-ui/core'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'

interface ThirdLevelMenuProps {
    meta: WidgetMeta
}

export const ThirdLevelMenu = memo<ThirdLevelMenuProps>(({ meta }) => {
    return (
        <EmptyCard meta={meta}>
            <LevelMenu meta={meta} />
        </EmptyCard>
    )
})
