import React from 'react'
import { render } from 'react-dom'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './index.css'
import AppLayout from './components/AppLayout/AppLayout'
import { Provider } from 'react-redux'
import { store } from '@store'

const App = (
    <Provider store={store}>
        <ConfigProvider>
            <AppLayout />
        </ConfigProvider>
    </Provider>
)

render(App, document.getElementById('root'))
