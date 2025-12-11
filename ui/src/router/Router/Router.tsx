import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { createHashHistory } from 'history'
import { useAppSelector } from '@store'
import { getRouteFromString } from '../index'
import { actions } from '@actions'
import {
    backButtonConfirmMessage,
    forwardButtonConfirmMessage,
    handleBeforeUnload,
    isBrowserNavigationWarnEnabled
} from '@constants/navigationGuard'

interface ILocationState {
    _index: number
}

const historyObj = createHashHistory()

export const Router: React.FC = ({ children }) => {
    const path = useAppSelector(state => state.router.path)
    const search = useAppSelector(state => state.router.search)
    const active = useAppSelector(state => state.session.active)

    const pathRef = useRef(path)
    const historyIndexRef = useRef(0)

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
            const currentIndex = (location.state as ILocationState)?._index ?? 0

            if (pathRef.current === location.pathname) {
                historyIndexRef.current = currentIndex
                return
            }

            if (isBrowserNavigationWarnEnabled && action === 'POP') {
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

            historyIndexRef.current = currentIndex
            dispatch(actions.changeLocation({ location: getRouteFromString(location.pathname) }))
        })

        return () => {
            unlistenHistory()
        }
    }, [dispatch, path, search])

    useEffect(() => {
        if (isBrowserNavigationWarnEnabled) {
            active
                ? window.addEventListener('beforeunload', handleBeforeUnload)
                : window.removeEventListener('beforeunload', handleBeforeUnload)
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [active])

    return <>{children}</>
}
