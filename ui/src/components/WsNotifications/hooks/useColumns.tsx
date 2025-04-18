import React, { useMemo } from 'react'
import moment from 'moment'
import { NotificationLink } from '@interfaces/notification'
import { WsLinks } from '@components/WsNotifications/WsLinks'
import { ColumnProps } from 'antd/es/table'
import { useTranslation } from 'react-i18next'

export const useColumns = ({ linksEnabled }: { linksEnabled?: boolean } = {}) => {
    const { t } = useTranslation()

    return useMemo(() => {
        const columns: ColumnProps<any>[] = [
            {
                title: t('Create Time'),
                dataIndex: 'time',
                render: (value: string) => {
                    return <span>{moment(value).format('DD.MM.YYYY, HH:mm')}</span>
                }
            },
            {
                title: t('Message'),
                dataIndex: 'text',
                render: (value: string) => {
                    return <span>{value}</span>
                }
            }
        ]

        if (linksEnabled) {
            columns.push({
                title: t('Links'),
                dataIndex: 'links',
                render: (value: NotificationLink[]) => <WsLinks links={value} />
            })
        }

        return columns
    }, [linksEnabled, t])
}
