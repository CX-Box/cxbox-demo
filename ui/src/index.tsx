import React from 'react'
import { render } from 'react-dom'
import './polyfills'
import { LanguageProvider } from './i18n/components/LanguageProvider'
import './index.css'
import AppLayout from './components/AppLayout/AppLayout'
import { Provider } from 'react-redux'
import { store } from '@store'
import { Router } from '@router'

const App = (
    <Provider store={store}>
        <LanguageProvider>
            <Router>
                <AppLayout />
            </Router>
        </LanguageProvider>
    </Provider>
)

render(App, document.getElementById('root'))
