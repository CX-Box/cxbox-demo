import React from 'react'
import ViewNavigation from '../ViewNavigation/ViewNavigation'
import UserMenu from './components/UserMenu/UserMenu'
import styles from './AppBar.module.css'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import { Layout } from 'antd'
import cn from 'classnames'
import { AppWidgetMeta } from '../../interfaces/widget'
import { isBarNavigation } from '../../utils/isNavigationForBar'
import { getNavigationDepth } from '../../utils/getNavigationDepth'

function AppBar() {
    const widgets = useSelector((state: AppState) => state.view.widgets)
    const menuWidget = widgets?.find(isBarNavigation) as AppWidgetMeta
    const showTabs = !!menuWidget
    const depth = getNavigationDepth(menuWidget?.type)

    return (
        <Layout.Header className={cn(styles.container, { [styles.withTabs]: showTabs })}>
            {showTabs && <ViewNavigation depth={depth} />}
            <UserMenu />
        </Layout.Header>
    )
}

export default React.memo(AppBar)
