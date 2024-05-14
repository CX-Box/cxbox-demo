import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import enUs from 'antd/es/locale-provider/en_US'
import './index.css'
import AppLayout from './components/AppLayout/AppLayout'
import { Provider } from 'react-redux'
import { store } from '@store'
import { initLocale } from '@i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { keycloak, keycloakOptions } from './keycloak'
import { useHashLocation } from 'wouter/use-hash-location'
import { Router } from 'wouter'

initLocale('en')

const queryClient = new QueryClient()

keycloak.init(keycloakOptions)

const App = (
    <QueryClientProvider client={queryClient}>
        <Provider store={store}>
            <ConfigProvider locale={enUs}>
                <AppLayout />
            </ConfigProvider>
        </Provider>
        <ReactQueryDevtools />
    </QueryClientProvider>
)

const root = createRoot(document.getElementById('root')!)

root.render(App)
