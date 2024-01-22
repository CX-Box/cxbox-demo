import React, { useCallback, useRef, useState } from 'react'
import { Icon, Modal, Table } from 'antd'
import { useEffect } from 'react'

import cn from 'classnames'
import { AxiosError } from 'axios'
import styles from './Notification.less'
import { getDefaultModalBodyHeight } from './Notification.utils'
import markAsReadIcon from './img/markAsRead.svg'
import { useToggle } from '@hooks/useToggle'
import { columns, DEFAULT_MODAL_WIDTH } from './Notification.constants'
import { useTranslation } from 'react-i18next'
import PaginationNotification from './PaginationNotification'
import { useStompNotification } from '@hooks/notification'
import Button from '../ui/Button/Button'
import { CxBoxApiInstance as instance } from '../../api'

interface NotificationProps {}

/**
 * Do not reuse
 */
export function Notification(props: NotificationProps) {
    const { t } = useTranslation()
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [visible, toggleVisible] = useToggle(false)
    const notification = useStompNotification({ check: true })
    const { setRead, getList } = notification

    const containerRef = useRef<HTMLDivElement>(null)
    const tableRef = useRef<HTMLDivElement>(null)

    const toggleModalVisibility = useCallback(
        (value: boolean) => {
            toggleVisible(value)

            value && getList()
        },
        [getList, toggleVisible]
    )

    useEffect(() => {
        const handlePopState = () => {
            if (visible) {
                toggleModalVisibility(false)
            }
        }

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [toggleModalVisibility, visible])

    const handleMarkAsReadClick = useCallback(() => {
        if (selectedRowKeys.length > 0) {
            setRead(selectedRowKeys)
            setSelectedRowKeys([])
        }
    }, [selectedRowKeys, setRead])

    const deleteSelectedRows = () => {
        if (selectedRowKeys.length > 0) {
            return instance.deleteNotifications(selectedRowKeys).then(
                () => {
                    setSelectedRowKeys([])
                    notification.getCount()
                    notification.getCurrentPage()
                },
                (e: AxiosError) => {
                    console.error(e)
                    return null
                }
            )
        }
        return null
    }

    const title = (
        <div>
            <h1 className={styles.title}>{t('Notifications')}</h1>
            <div className={styles.operationsContainer}>
                <Button onClick={handleMarkAsReadClick} type="formOperation" size="small">
                    <Icon
                        component={() => {
                            return <img src={markAsReadIcon} alt="markAsReadIcon" />
                        }}
                    />
                    <span className={cn(styles.filterLabel)}>{t('Mark as Read')}</span>
                </Button>
                <Button onClick={deleteSelectedRows} type="formOperation" size="small">
                    <Icon type="delete" className={styles.notificationOperationIcon} />
                    <span className={cn(styles.filterLabel)}>{t('Delete')}</span>
                </Button>
            </div>
        </div>
    )

    const footer = (
        <div className={styles.footerContainer}>
            <div className={styles.pagination}>
                <PaginationNotification />
            </div>
        </div>
    )

    return (
        <div>
            <Button className={styles.notification} type="bar" onClick={() => toggleModalVisibility(true)}>
                {(notification.state.unreadCount as number) > 0 && <span className={styles.dot}>{notification.state.unreadCount}</span>}
                <Icon type="bell" style={{ marginBottom: '-4px' }} />
            </Button>
            <div ref={containerRef} className={cn(styles.popupContainer, styles.closeIcon)}>
                <Modal
                    closable={true}
                    getContainer={false}
                    visible={visible}
                    onCancel={() => toggleModalVisibility(false)}
                    bodyStyle={{ height: getDefaultModalBodyHeight(containerRef) }}
                    width={DEFAULT_MODAL_WIDTH}
                    title={title}
                    footer={footer}
                >
                    <div ref={tableRef} className={styles.tableWidgetContainer}>
                        <div className={styles.tableContainer}>
                            <Table
                                rowKey="id"
                                rowClassName={record => (!record.isRead ? styles.notificationUnread : '')}
                                columns={columns}
                                dataSource={notification.state.data}
                                rowSelection={{
                                    selectedRowKeys,
                                    onChange: (selectedRows: any) => {
                                        setSelectedRowKeys(selectedRows)
                                    }
                                }}
                                pagination={false}
                                onRow={(record, rowIndex) => {
                                    return {
                                        onClick: () => {
                                            if (!record.isRead) {
                                                notification.setRead([record.id])
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
