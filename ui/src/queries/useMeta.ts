import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../api'
import { useBcLocation } from '@hooks/useBcLocation'
import { LoginResponse } from '@cxbox-ui/core'
import { firstValueFrom } from 'rxjs'
import { useCallback, useMemo } from 'react'

export const useMeta = <TData = LoginResponse>(select?: (data: LoginResponse) => TData) =>
    useQuery({
        queryKey: ['meta'],
        queryFn: () => firstValueFrom(CxBoxApiInstance.loginByRoleRequest('')),
        staleTime: Infinity,
        select: select
    })

export const useScreenMeta = () => {
    const [location] = useBcLocation()

    const screenSelector = useCallback(
        (data: LoginResponse) =>
            data?.screens.find(screen => screen.name === location.screenName) ||
            data?.screens.find(screen => screen.defaultScreen) ||
            data?.screens[0],
        [location]
    )
    const screenMeta = useMeta(screenSelector)
}

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
        [location]
    )

    return useMeta(viewSelector)
}

export const useWidgetMeta = (widgetName: string) => {
    const [location] = useBcLocation()

    const widgetSelector = useCallback(
        (data: LoginResponse) => {
            const screen =
                data?.screens.find(screen => screen.name === location.screenName) ||
                data?.screens.find(screen => screen.defaultScreen) ||
                data?.screens[0]

            const view =
                screen?.meta?.views.find(view => view.name === location.viewName) ||
                screen?.meta?.views.find(view => view.name === screen?.meta?.primary) ||
                screen?.meta?.views[0]

            return view?.widgets.find(widget => widget.name === widgetName)
        },
        [location, widgetName]
    )

    return useMeta(widgetSelector)
}

export const useRowMeta = (bcName?: string) => {
    const { data: screenMeta } = useScreenMeta()
    const bc = screenMeta?.meta?.bo.bc

    bc?.find(bc => bc.name === bcName)
}
