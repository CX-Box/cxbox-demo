import moment from 'moment/moment'
import React from 'react'
import { NotificationLink } from '@interfaces/notification'
import { WsLinks } from '@components/WsNotifications/WsLinks'

export const DEFAULT_MODAL_WIDTH = 1395
export const DEFAULT_MODAL_HEIGHT = 803
export const DEFAULT_MODAL_BODY_HEIGHT = 500

export const columns = [
    {
        title: 'Create Time',
        dataIndex: 'time',
        render: (value: string) => {
            return <span>{moment(value).format('DD.MM.YYYY, HH:mm')}</span>
        }
    },
    {
        title: 'Message',
        dataIndex: 'text',
        render: (value: string) => {
            return <span>{value}</span>
        }
    }
]

export const columnsWithLinks = [
    ...columns,
    {
        title: 'Links',
        dataIndex: 'links',
        render: (value: NotificationLink[]) => <WsLinks links={value} />
    }
]
