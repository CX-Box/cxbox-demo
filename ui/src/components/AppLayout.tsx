import React from 'react'
import { Layout } from 'antd'
import { Sider } from './Sider.tsx'
import { Content } from './Content.tsx'

export const AppLayout: React.FC = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider />
            <Content />
        </Layout>
    )
}
