import React from 'react'
import './imports/rxjs'
import { render } from 'react-dom'
import { Provider } from '@cxbox-ui/core'
import { ConfigProvider } from 'antd'
import enUs from 'antd/es/locale-provider/en_US'
import { reducers } from './reducers'
import { epics } from './epics'
import './index.css'
import AppLayout from './components/AppLayout/AppLayout'
import { axiosInstance } from './api/session'
import { middlewares } from './middlewares'

const App = (
    <Provider customReducers={reducers} customEpics={epics} axiosInstance={axiosInstance()} customMiddlewares={middlewares}>
        <ConfigProvider locale={enUs}>
            <AppLayout />
        </ConfigProvider>
    </Provider>
)

render(App, document.getElementById('root'))
