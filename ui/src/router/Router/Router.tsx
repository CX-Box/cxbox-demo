import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { createHashHistory } from 'history'
import { useAppSelector } from '@store'
import { getRouteFromString } from '../index'
import { actions } from '@actions'
import { backButtonConfirmMessage, forwardButtonConfirmMessage } from '@constants/navigationGuard'
import { EFeatureSettingKey } from '@interfaces/session'

interface ILocationState {
    _index: number
}

const historyObj = createHashHistory()

export const Router: React.FC = ({ children }) => {
    const path = useAppSelector(state => state.router.path)
    const search = useAppSelector(state => state.router.search)
    const isBrowserNavigationWarnEnabled =
        useAppSelector(state =>
            state.session.featureSettings?.find(featureSetting => featureSetting.key === EFeatureSettingKey.isBrowserNavigationWarnEnabled)
        )?.value === 'true'

    const pathRef = useRef(path)
    const historyIndexRef = useRef(0)

    useEffect(() => {
        const state = historyObj.location.state as ILocationState | undefined

        if (typeof state?._index !== 'number') {
            historyObj.replace(historyObj.location.pathname + historyObj.location.search, { _index: ++historyIndexRef.current })
        }
    }, [])

    // Changes location when the state changes
    useEffect(() => {
        pathRef.current = path

        if (path !== '/' && path.length !== 0 && (path !== historyObj.location.pathname || search !== historyObj.location.search)) {
            historyObj.push(path + search, { _index: ++historyIndexRef.current })
        }
    }, [path, search])

    const dispatch = useDispatch()

    // Updates the state when the location changes from outside
    useEffect(() => {
        const unlistenHistory = historyObj.listen(({ location, action }) => {
            if (isBrowserNavigationWarnEnabled) {
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
                    historyObj.replace(historyObj.location.pathname + historyObj.location.search, { _index: ++historyIndexRef.current })
                }
            }

            if (pathRef.current !== location.pathname) {
                dispatch(actions.changeLocation({ location: getRouteFromString(location.pathname) }))
            }
        })

        return () => {
            unlistenHistory()
        }
    }, [dispatch, isBrowserNavigationWarnEnabled, path, search])

    return <>{children}</>
}
