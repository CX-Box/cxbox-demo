import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../api'

export const useMeta = () =>
    useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity
    })

export const useScreenMeta = (screenName?: string) =>
    useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity,
        select: data =>
            data?.screens.find(screen => screen.name === screenName) ||
            data?.screens.find(screen => screen.defaultScreen) ||
            data?.screens[0]
    })

export const useViewMeta = (screenName?: string, viewName?: string) =>
    useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity,
        select: data => {
            const screen =
                data?.screens.find(screen => screen.name === screenName) ||
                data?.screens.find(screen => screen.defaultScreen) ||
                data?.screens[0]

            return (
                screen?.meta?.views.find(view => view.name === viewName) ||
                screen?.meta?.views.find(view => view.name === screen?.meta?.primary) ||
                screen?.meta?.views[0]
            )
        }
    })
