import { AppWidgetMeta } from '@interfaces/widget'
import { ComponentType, lazy, Suspense, useMemo } from 'react'

export interface BaseLayoutProps {
    widgets: AppWidgetMeta[]
}

const layoutName = 'DashboardLayout'

const Layout: React.FC<BaseLayoutProps> = ({ widgets }) => {
    const LayoutComponent = useMemo(() => lazy<ComponentType<BaseLayoutProps>>(() => import(`@layouts/${layoutName}/index`)), [])
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LayoutComponent widgets={widgets} />
        </Suspense>
    )
}

export default Layout
