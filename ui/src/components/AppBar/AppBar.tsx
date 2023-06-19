import React from 'react'
import UserMenu from './components/UserMenu/UserMenu'
import styles from './AppBar.module.css'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import { Layout } from 'antd'
import cn from 'classnames'
import { AppWidgetMeta } from '../../interfaces/widget'
import { isBarNavigation } from '../../utils/isNavigationForBar'
import LevelMenu from '../widgets/LevelMenu/LevelMenu'

function AppBar() {
    const widgets = useSelector((state: AppState) => state.view.widgets)
    const menuWidget = widgets?.find(isBarNavigation) as AppWidgetMeta
    const showTabs = !!menuWidget

    return (
        <Layout.Header className={cn(styles.container, { [styles.withTabs]: showTabs })}>
            {showTabs && <LevelMenu meta={menuWidget} />}
            <UserMenu />
        </Layout.Header>
    )
}

export default React.memo(AppBar)
