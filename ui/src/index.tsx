import React from 'react'
import { render } from 'react-dom'
import './index.css'
import './polyfills'
import { LanguageProvider } from './i18n/components/LanguageProvider'
import AppLayout from './components/AppLayout/AppLayout'
import { Provider } from 'react-redux'
import { store } from '@store'

const App = (
    <Provider store={store}>
        <LanguageProvider>
            <AppLayout />
        </LanguageProvider>
    </Provider>
)

render(App, document.getElementById('root'))
