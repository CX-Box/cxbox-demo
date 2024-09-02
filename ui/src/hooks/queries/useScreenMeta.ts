import { useBcLocation } from '@hooks/useBcLocation'
import { useCallback } from 'react'
import { LoginResponse } from '@cxbox-ui/core'
import { useMeta } from './useMeta'

export const useScreenMeta = () => {
    const [location] = useBcLocation()

    const screenSelector = useCallback(
        (data: LoginResponse) =>
            data?.screens.find(screen => screen.name === location.screenName) ||
            data?.screens.find(screen => screen.defaultScreen) ||
            data?.screens[0],
        [location.screenName]
    )

    return useMeta(screenSelector)
}
