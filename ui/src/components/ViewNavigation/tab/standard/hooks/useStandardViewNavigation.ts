import { useCallback } from 'react'
import { useStandardViewTabs } from '@components/ViewNavigation/tab/standard/hooks/useStandardViewTabs'
import { useChangeLocation } from '@router'

export const useStandardViewNavigation = (depth = 1) => {
    const changeLocation = useChangeLocation({ isTab: true })

    const push = useCallback(
        (url: string) => {
            changeLocation(url)
        },
        [changeLocation]
    )

    const tabs = useStandardViewTabs(depth)
    const activeTab = tabs?.find(tab => tab.selected)

    return {
        tabs,
        handleChange: push,
        activeKey: activeTab?.url
    }
}
