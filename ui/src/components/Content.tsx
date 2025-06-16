import { Layout } from 'antd'
import { DashboardLayout } from '../layouts/DashboardLayout.tsx'

export const Content = () => {
    return (
        <Layout.Content style={{ padding: 32 }}>
            <DashboardLayout />
        </Layout.Content>
    )
}
