import { useCallback, useEffect, useState } from 'react'
import { createUrlWithContext } from '@utils/createUrlWithContext'
import { usePrevious } from '@hooks/usePrevious'
import { useViewTabs as useCoreViewTabs } from '@hooks/useViewTabs'
import { getRouteFromString, useChangeLocation } from '@router'
import { useAppSelector } from '@store'

const getBcNameFromBcPath = (bcPath?: string) => {
    if (!bcPath) {
        return ''
    }

    const enpPosition = bcPath.indexOf('/')

    return bcPath.slice(0, enpPosition)
}

const getBcNameFromLocation = () => {
    const parsedLocation = getRouteFromString(window.location.hash.slice(1))

    return getBcNameFromBcPath(parsedLocation?.bcPath)
}

export const useLocationContext = (depth: number) => {
    const needContextBcName = depth !== 0
    const [contextBcName, setContextBcName] = useState<string>('')
    const changeLocation = useChangeLocation()

    const { cachedBc, path } = useAppSelector(state => {
        return { cachedBc: state.screen.cachedBc, path: state.router.path }
    })

    const prevPath = usePrevious(path)

    useEffect(() => {
        if (needContextBcName && prevPath !== path) {
            setContextBcName(getBcNameFromLocation())
        }
    }, [prevPath, setContextBcName, path, needContextBcName])

    const pushWithContext = useCallback(
        (urlWithoutBcPath: string) => {
            const url = createUrlWithContext(urlWithoutBcPath, cachedBc[contextBcName])

            changeLocation(url)
        },
        [cachedBc, changeLocation, contextBcName]
    )

    return {
        handleChange: needContextBcName ? pushWithContext : null
    }
}

export const useViewTabs = (depth = 1) => {
    const { handleChange: pushWithContext } = useLocationContext(depth)
    const changeLocation = useChangeLocation()

    const push = useCallback(
        (url: string) => {
            changeLocation(url)
        },
        [changeLocation]
    )

    const tabs = useCoreViewTabs(depth).filter(tab => !tab.hidden)

    return {
        tabs,
        handleChange: pushWithContext ? pushWithContext : push,
        activeKey: tabs.find(tab => tab.selected)?.url
    }
}
