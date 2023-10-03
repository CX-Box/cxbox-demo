import moment from 'moment/moment'
import { Button } from 'antd'
import React from 'react'
import { getMessageDownloadFileEndpoint } from '../../api/notification'

export const DEFAULT_MODAL_WIDTH = 1395
export const DEFAULT_MODAL_HEIGHT = 803
export const DEFAULT_MODAL_BODY_HEIGHT = 500

export const columns = [
    {
        title: 'Notification Type',
        dataIndex: 'notificationType'
    },
    {
        title: 'Created Date',
        dataIndex: 'createdDate',
        render: function createdDate(text: string, record: any) {
            return <span>{moment(record.createdDate).format('DD.MM.YYYY, HH:mm')}</span>
        }
    },
    {
        title: 'Message',
        dataIndex: 'message',
        render: function message(text: string, record: any) {
            const description = record?.description ? JSON.parse(record?.description) : null
            return <span>{description?.message != null ? description?.message : null}</span>
        }
    },
    {
        title: '',
        dataIndex: '',
        render: function downloadButton(text: string, record: any) {
            const description = record?.description ? JSON.parse(record?.description) : null
            if (description != null && description?.jmsId && description?.fileId) {
                if (!record.isDeleted) {
                    // TODO MY нужно ли оставить возможность скачивания или убрать колонку и запрос
                    return (
                        <Button
                            type="link"
                            target="_blank"
                            href={getMessageDownloadFileEndpoint(`report/standardReport/${description?.jmsId}?id=${description?.fileId}`)}
                        >
                            Download
                        </Button>
                    )
                }
                return null
            }
            return null
        }
    }
]
