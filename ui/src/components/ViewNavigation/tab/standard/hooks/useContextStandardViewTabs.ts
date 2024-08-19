import { useCallback, useEffect, useState } from 'react'
import { createUrlWithContext } from '@utils/createUrlWithContext'
import { useStandardViewTabs } from '@components/ViewNavigation/tab/standard/hooks/useStandardViewTabs'
import { useChangeLocation, getRouteFromString } from '@router'
import { useAppSelector } from '@store'
import { usePrevious } from '@hooks/usePrevious'

const getBcNameFromPath = (path?: string) => {
    const bcPath = path ? getRouteFromString(path)?.bcPath : undefined

    if (!bcPath) {
        return ''
    }

    const enpPosition = bcPath.indexOf('/')

    return bcPath.slice(0, enpPosition)
}

export const useContextStandardViewTabs = (depth = 1) => {
    const needBcPathContext = depth !== 0
    const changeLocation = useChangeLocation()

    const [contextBcName, setContextBcName] = useState<string>('')
    const cachedBc = useAppSelector(state => state.screen.cachedBc)
    const path = useAppSelector(state => state.router.path)
    const prevPath = usePrevious(path)

    useEffect(() => {
        if (needBcPathContext && prevPath !== path) {
            setContextBcName(getBcNameFromPath(path))
        }
    }, [prevPath, setContextBcName, path, needBcPathContext])

    const pushWithContext = useCallback(
        (urlWithoutBcPath: string) => {
            changeLocation(createUrlWithContext(urlWithoutBcPath, cachedBc[contextBcName]))
        },
        [cachedBc, changeLocation, contextBcName]
    )

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
        handleChange: needBcPathContext ? pushWithContext : push,
        activeKey: activeTab?.url
    }
}
