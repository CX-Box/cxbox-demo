import { shallowEqual } from 'react-redux'
import { interfaces } from '@cxbox-ui/core'
import { RootState, useAppSelector } from '@store'
import { getViewTabs } from '@utils/viewTabs'

interface UseViewTabsState {
    activeView: string
    views: interfaces.ViewMetaResponse[]
    navigation?: Array<Exclude<interfaces.MenuItem, interfaces.ViewNavigationCategory>>
}

function mapStateToProps(state: RootState): UseViewTabsState {
    return {
        activeView: state.view.name,
        views: state.screen.views,
        navigation: state.session.screens.find(screen => screen.name === state.screen.screenName)?.meta?.navigation?.menu
    }
}

/**
 * Returns an array of tabs for specified level of navigation
 *
 * @param depth 1 for top level navigation; 2, 3, 4 for SecondLevelMenu, ThirdLevelMenu and FourthLevelMenu
 * @category Hooks
 */
export function useViewTabs(depth: number) {
    const state: UseViewTabsState = useAppSelector(mapStateToProps, shallowEqual)
    const items = getViewTabs(state.navigation, depth, state.activeView)
    return items.map(item => {
        const matchingView = state.views.find(view => view.name === item.viewName)
        return {
            ...item,
            title: item.title || matchingView?.title,
            url: matchingView?.url,
            selected: item.viewName === state.activeView
        }
    })
}
