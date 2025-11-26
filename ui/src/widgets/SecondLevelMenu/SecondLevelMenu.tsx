import { memo } from 'react'
import { WidgetMeta } from '@cxbox-ui/core'
import LevelMenu from '@components/LevelMenu/LevelMenu'
import EmptyCard from '@components/EmptyCard/EmptyCard'

interface SecondLevelMenuProps {
    meta: WidgetMeta
}

export const SecondLevelMenu = memo<SecondLevelMenuProps>(({ meta }) => {
    return (
        <EmptyCard meta={meta}>
            <LevelMenu meta={meta} />
        </EmptyCard>
    )
})
