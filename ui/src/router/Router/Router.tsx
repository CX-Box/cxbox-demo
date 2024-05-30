import React, { useEffect, useRef } from 'react'
import { useAppSelector } from '@store'
import { createBrowserHistory } from 'history'
import { actions } from '@actions'
import { getRouteFromString } from '../index'
import { useDispatch } from 'react-redux'

const historyObj = createBrowserHistory()

export const Router: React.FC = ({ children }) => {
    const path = useAppSelector(state => state.router.path)
    const search = useAppSelector(state => state.router.search)
    const pathRef = useRef(path)

    // Changes location when the state changes
    useEffect(() => {
        pathRef.current = path

        if (path !== '/' && path.length !== 0 && (path !== historyObj.location.pathname || search !== historyObj.location.search)) {
            historyObj.push(path + search)
        }
    }, [path, search])

    const dispatch = useDispatch()

    // Updates the state when the location changes from outside
    useEffect(() => {
        const unlistenHistory = historyObj.listen(({ location }) => {
            if (pathRef.current !== historyObj.location.pathname) {
                dispatch(actions.changeLocation({ location: getRouteFromString(location.pathname) }))
            }
        })

        return () => {
            unlistenHistory()
        }
    }, [dispatch])

    return <>{children}</>
}
