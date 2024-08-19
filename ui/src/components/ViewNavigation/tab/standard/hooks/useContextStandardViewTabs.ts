import { useCallback } from 'react'
import { createUrlWithContext } from '@utils/createUrlWithContext'
import { useStandardViewTabs } from '@components/ViewNavigation/tab/standard/hooks/useStandardViewTabs'
import { useChangeLocation } from '@router'
import { useAppSelector } from '@store'

export const useContextStandardViewTabs = (depth = 1) => {
    const bcPath = useAppSelector(state => state.router.bcPath ?? '')
    const needBcPathContext = depth !== 0
    const changeLocation = useChangeLocation()

    const push = useCallback(
        (url: string) => {
            changeLocation(url)
        },
        [changeLocation]
    )

    const pushWithContext = useCallback(
        (urlWithoutBcPath: string) => {
            changeLocation(createUrlWithContext(urlWithoutBcPath, bcPath))
        },
        [changeLocation, bcPath]
    )

    const tabs = useStandardViewTabs(depth)
    const activeTab = tabs?.find(tab => tab.selected)

    return {
        tabs,
        handleChange: needBcPathContext ? pushWithContext : push,
        activeKey: activeTab?.url
    }
}
