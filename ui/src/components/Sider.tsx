import { Layout } from 'antd'
import { useState } from 'react'
import logo from '../assets/icons/logo.svg'
import logoWide from '../assets/icons/logo-wide.svg'
import { ScreenNavigation } from './ScreenNavigation.tsx'

export const Sider = () => {
    const [menuCollapsed, setMenuCollapsed] = useState(false)

    const handleMenuCollapse = () => setMenuCollapsed(prevState => !prevState)

    return (
        <Layout.Sider data-test="LEFT_SIDER" theme="light" collapsed={menuCollapsed} collapsedWidth={48} width={256}>
            <div>
                <img src={menuCollapsed ? logo : logoWide} onClick={handleMenuCollapse} alt="logo" />
            </div>
            <div>
                <ScreenNavigation />
            </div>
        </Layout.Sider>
    )
}
