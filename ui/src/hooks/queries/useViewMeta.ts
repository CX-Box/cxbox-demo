import { useBcLocation } from '@hooks/useBcLocation'
import { useCallback } from 'react'
import { LoginResponse } from '@cxbox-ui/core'
import { useMeta } from './useMeta'

export const useViewMeta = () => {
    const [location] = useBcLocation()

    const viewSelector = useCallback(
        (data: LoginResponse) => {
            const screen =
                data?.screens.find(screen => screen.name === location.screenName) ||
                data?.screens.find(screen => screen.defaultScreen) ||
                data?.screens[0]

            return (
                screen?.meta?.views.find(view => view.name === location.viewName) ||
                screen?.meta?.views.find(view => view.name === screen?.meta?.primary) ||
                screen?.meta?.views[0]
            )
        },
        [location.screenName, location.viewName]
    )

    return useMeta(viewSelector)
}
