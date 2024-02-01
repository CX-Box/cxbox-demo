import { actions, utils } from '@cxbox-ui/core'
import { useDispatch } from 'react-redux'
import { useCallback } from 'react'
export { Router } from './Router/Router'

export const getRouteFromString = (ulrString: string) => {
    const url = new URL(ulrString, window.location.origin)

    return utils.defaultParseURL(url)
}

export const useChangeLocation = () => {
    const dispatch = useDispatch()

    return useCallback(
        (ulrString: string) => {
            dispatch(actions.changeLocation({ location: getRouteFromString(ulrString) }))
        },
        [dispatch]
    )
}
