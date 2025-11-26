import get from 'lodash/get'
import * as layouts from '@layouts'
import { FC } from 'react'

interface LayoutProps {
    type?: string
}

export const Layout: FC<LayoutProps> = ({ type = 'DashboardLayout' }) => {
    const LayoutComponent: FC = get(layouts, type, () => null)
    return <LayoutComponent />
}
