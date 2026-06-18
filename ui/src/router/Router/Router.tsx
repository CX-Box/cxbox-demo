import React, { useEffect, useRef, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { createHashHistory } from 'history'
import { useAppSelector } from '@store'
import { getRouteFromString } from '../index'
import { actions } from '@actions'
import { backButtonConfirmMessage, forwardButtonConfirmMessage } from '@constants/navigationGuard'
import { EFeatureSettingKey } from '@interfaces/session'
import { useFeatureSettingFlag } from '@hooks/featureSetting'

interface ILocationState {
    _index: number
}

export const Router: React.FC = ({ children }) => {
    const historyObj = useMemo(() => {
        return createHashHistory()
    }, [])

    const path = useAppSelector(state => state.router.path)
    const search = useAppSelector(state => state.router.search)
    const browserNavigationWarnEnabled = useFeatureSettingFlag(EFeatureSettingKey.browserNavigationWarnEnabled)

    const pathRef = useRef(path)
    const historyIndexRef = useRef(0)

    // Initializing the History Index
    useEffect(() => {
        const state = historyObj.location.state as ILocationState | undefined

        if (typeof state?._index !== 'number') {
            historyObj.replace(
                { pathname: historyObj.location.pathname, search: historyObj.location.search },
                { _index: ++historyIndexRef.current }
            )
        }
    }, [historyObj])

    // Redux -> History synchronization (location changes from within the application)
    useEffect(() => {
        pathRef.current = path

        if (path !== '/' && path.length !== 0 && (path !== historyObj.location.pathname || search !== historyObj.location.search)) {
            historyObj.push({ pathname: path, search: search }, { _index: ++historyIndexRef.current })
        }
    }, [path, search, historyObj])

    const dispatch = useDispatch()

    // Synchronization History -> Redux (external transitions and browser buttons)
    useEffect(() => {
        const unlistenHistory = historyObj.listen(({ location, action }) => {
            if (browserNavigationWarnEnabled) {
                const currentIndex = (location.state as ILocationState)?._index
                const hasIndex = typeof currentIndex === 'number'
                const isBrowserButtonClicked = hasIndex && Math.abs(currentIndex - historyIndexRef.current) === 1

                if (action === 'POP' && isBrowserButtonClicked) {
                    if (currentIndex < historyIndexRef.current) {
                        if (!window.confirm(backButtonConfirmMessage)) {
                            historyObj.forward()
                            return
                        }
                    } else if (currentIndex > historyIndexRef.current) {
                        if (!window.confirm(forwardButtonConfirmMessage)) {
                            historyObj.back()
                            return
                        }
                    }
                }

                if (hasIndex) {
                    historyIndexRef.current = currentIndex
                } else {
                    historyObj.replace({ pathname: location.pathname, search: location.search }, { _index: ++historyIndexRef.current })
                }
            }

            if (pathRef.current !== location.pathname) {
                dispatch(actions.changeLocation({ location: getRouteFromString(location.pathname) }))
            }
        })

        return () => {
            unlistenHistory()
        }
    }, [dispatch, browserNavigationWarnEnabled, historyObj])

    return <>{children}</>
}
