import './polyfills'
import React from 'react'
import { render } from 'react-dom'
import { ConfigProvider } from 'antd'
import enUs from 'antd/es/locale-provider/en_US'
import './index.css'
import AppLayout from './components/AppLayout/AppLayout'
import { Provider } from 'react-redux'
import { store } from '@store'
import { Router } from '@router'
import { initLocale } from '@i18n'

initLocale('en')

const App = (
    <Provider store={store}>
        <ConfigProvider locale={enUs}>
            <Router>
                <AppLayout />
            </Router>
        </ConfigProvider>
    </Provider>
)

render(App, document.getElementById('root'))
