import { useCallback, useEffect, useState } from 'react'
import { historyObj, parseLocation, useViewTabs as useCoreViewTabs } from '@cxbox-ui/core'
import { shallowEqual, useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import { usePrevious } from '../../hooks/usePrevious'
import { createUrlWithContext } from '../../utils/createUrlWithContext'

const getParsedLocation = () => {
    return parseLocation()(historyObj?.location)
}

const isEven = (value: number) => value % 2 === 0

const getBcNameFromBcPath = (bcPath?: string) => {
    if (!bcPath) {
        return ''
    }

    const splittedBcPath = bcPath.split('/').filter(item => !!item)

    return isEven(splittedBcPath.length) ? splittedBcPath[splittedBcPath.length - 2] : splittedBcPath[splittedBcPath.length - 1]
}

const getBcNameFromLocation = () => {
    const parsedLocation = getParsedLocation()

    return getBcNameFromBcPath(parsedLocation?.bcPath)
}

export const useLocationContext = (depth: number) => {
    const needContextBcName = depth !== 1
    const [contextBcName, setContextBcName] = useState<string>('')

    const { cachedBc, path } = useSelector((state: AppState) => {
        return { cachedBc: state.screen.cachedBc, path: state.router.path }
    }, shallowEqual)

    const prevPath = usePrevious(path)

    useEffect(() => {
        if (needContextBcName && prevPath !== path) {
            setContextBcName(getBcNameFromLocation())
        }
    }, [prevPath, setContextBcName, path, needContextBcName])

    const pushWithContext = useCallback(
        (urlWithoutBcPath: string) => {
            const url = createUrlWithContext(urlWithoutBcPath, cachedBc[contextBcName])

            historyObj.push(url)
        },
        [cachedBc, contextBcName]
    )

    return {
        handleChange: needContextBcName ? pushWithContext : null
    }
}

export const useViewTabs = (depth = 1) => {
    const { handleChange: pushWithContext } = useLocationContext(depth)

    const push = useCallback((url: string) => {
        historyObj.push(url)
    }, [])

    const tabs = useCoreViewTabs(depth)
        .filter(tab => !tab.hidden)
        .filter(item => item.title !== undefined)

    return {
        tabs,
        handleChange: pushWithContext ? pushWithContext : push,
        activeKey: tabs.find(tab => tab.selected)?.url
    }
}
