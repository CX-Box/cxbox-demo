import { memo } from 'react'
import { WidgetMeta } from '@cxbox-ui/core'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'

interface FourthLevelMenuProps {
    meta: WidgetMeta
}

export const FourthLevelMenu = memo<FourthLevelMenuProps>(({ meta }) => {
    return (
        <EmptyCard meta={meta}>
            <LevelMenu meta={meta} />
        </EmptyCard>
    )
})
