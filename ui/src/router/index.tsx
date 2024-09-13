import { utils } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { actions } from '@actions'

export { Router } from './Router/Router'

export const getRouteFromString = (ulrString: string) => {
    const url = new URL(ulrString, window.location.origin)

    return utils.defaultParseURL(url)
}

type UseChangeLocation = { forceUpdate?: boolean; isTab?: boolean }

export const useChangeLocation = ({ forceUpdate = false, isTab = false }: UseChangeLocation = {}) => {
    const dispatch = useDispatch()

    return useCallback(
        (ulrString: string) => {
            dispatch(actions.changeLocation({ location: getRouteFromString(ulrString), forceUpdate, isTab }))
        },
        [dispatch, forceUpdate, isTab]
    )
}
