import { shallowEqual } from 'react-redux'
import { useAppSelector } from '@store'
import { useMemo } from 'react'
import { getStandardViewTabs } from '@components/ViewNavigation/tab/standard/utils/getStandardViewTabs'
/**
 * Returns an array of tabs for specified level of navigation
 *
 * @param depth 1, 2, 3 for SecondLevelMenu, ThirdLevelMenu and FourthLevelMenu
 * @category Hooks
 */
export function useStandardViewTabs(depth: number) {
    const { activeView, views, navigation } = useAppSelector(state => {
        return {
            activeView: state.view.name,
            views: state.screen.views,
            navigation: state.session.screens.find(screen => screen.name === state.screen.screenName)?.meta?.navigation?.menu
        }
    }, shallowEqual)

    const screenViewsDictionary = useMemo(() => {
        return views.reduce<Record<string, (typeof views)[number]>>((acc, view) => {
            if (view.name) {
                acc[view.name] = view
            }

            return acc
        }, {})
    }, [views])

    return useMemo(
        () =>
            getStandardViewTabs(navigation, views, depth, activeView)?.map(item => {
                const { title, url } = screenViewsDictionary[item.viewName as string] ?? {}
                return {
                    ...item,
                    title: item.title || title,
                    url
                }
            }),
        [activeView, depth, navigation, screenViewsDictionary, views]
    )
}
