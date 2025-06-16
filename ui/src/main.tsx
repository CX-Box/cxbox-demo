import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ConfigProvider, theme } from 'antd'
import enUs from 'antd/es/locale/en_US'
import { AppLayout } from './components/AppLayout.tsx'
import { HooksContext, hooksInstance } from './hooks/useHooks.ts'
import { keycloak, keycloakOptions } from './security'
import { Router } from './components/Router.tsx'
import { Modals } from './components/Modals.tsx'
import { ReactQueryProvider } from './components/ReactQueryProvider.tsx'

keycloak.init(keycloakOptions)

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HooksContext.Provider value={hooksInstance}>
            <ReactQueryProvider>
                <ConfigProvider locale={enUs} theme={{ algorithm: theme.darkAlgorithm }}>
                    <Router>
                        <AppLayout />
                    </Router>
                    <Modals />
                </ConfigProvider>
            </ReactQueryProvider>
        </HooksContext.Provider>
    </StrictMode>
)
