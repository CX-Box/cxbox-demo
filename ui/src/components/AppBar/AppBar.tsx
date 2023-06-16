import React from 'react'
import ViewNavigation from '../ViewNavigation/ViewNavigation'
import UserMenu from './components/UserMenu/UserMenu'
import styles from './AppBar.module.css'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import { Layout } from 'antd'
import cn from 'classnames'
import { AppWidgetMeta, CustomWidgetTypes } from '../../interfaces/widget'

function AppBar() {
    const widgets = useSelector((state: AppState) => state.view.widgets)
    const widgetTabs = widgets[0]?.type === CustomWidgetTypes.Tabs ? (widgets[0] as AppWidgetMeta) : undefined
    const showTabs = !!widgetTabs

    return (
        <Layout.Header className={cn(styles.container, { [styles.withTabs]: showTabs })}>
            {showTabs && <ViewNavigation depth={widgetTabs?.options?.navigationLevel} />}
            <UserMenu />
        </Layout.Header>
    )
}

export default React.memo(AppBar)
