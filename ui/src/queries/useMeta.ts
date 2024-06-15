import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../api'
import { useBcLocation } from '@hooks/useBcLocation'

export const useMeta = () =>
    useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity
    })

export const useScreenMeta = () => {
    const [location] = useBcLocation()
    return useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity,
        select: data =>
            data?.screens.find(screen => screen.name === location.screenName) ||
            data?.screens.find(screen => screen.defaultScreen) ||
            data?.screens[0]
    })
}

export const useViewMeta = () => {
    const [location] = useBcLocation()
    return useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity,
        select: data => {
            const screen =
                data?.screens.find(screen => screen.name === location.screenName) ||
                data?.screens.find(screen => screen.defaultScreen) ||
                data?.screens[0]

            return (
                screen?.meta?.views.find(view => view.name === location.viewName) ||
                screen?.meta?.views.find(view => view.name === screen?.meta?.primary) ||
                screen?.meta?.views[0]
            )
        }
    })
}

export const useWidgetMeta = (widgetName: string) => {
    const [location] = useBcLocation()
    return useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity,
        select: data => {
            const screen =
                data?.screens.find(screen => screen.name === location.screenName) ||
                data?.screens.find(screen => screen.defaultScreen) ||
                data?.screens[0]

            const view =
                screen?.meta?.views.find(view => view.name === location.viewName) ||
                screen?.meta?.views.find(view => view.name === screen?.meta?.primary) ||
                screen?.meta?.views[0]

            return view?.widgets.find(widget => widget.name === widgetName)
        }
    })
}

export const useBcMeta = (bcName?: string) => {
    const [location] = useBcLocation()
    return useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity,
        select: data => {
            if (bcName === undefined) {
                return undefined
            }
            const screen =
                data?.screens.find(screen => screen.name === location.screenName) ||
                data?.screens.find(screen => screen.defaultScreen) ||
                data?.screens[0]

            return screen?.meta?.bo.bc.find(bc => bc.name === bcName)
        }
    })
}
