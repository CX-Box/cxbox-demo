import React from 'react'
import './imports/rxjs'
import { render } from 'react-dom'
import { Provider } from '@cxbox-ui/core'
import { ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import { reducers } from './reducers'
import { epics } from './epics'
import './index.css'
import AppLayout from './components/AppLayout/AppLayout'
import { axiosInstance } from './api/session'

const App = (
    <Provider customReducers={reducers} customEpics={epics} axiosInstance={axiosInstance()}>
        <ConfigProvider>
            <AppLayout />
        </ConfigProvider>
    </Provider>
)

render(App, document.getElementById('root'))
