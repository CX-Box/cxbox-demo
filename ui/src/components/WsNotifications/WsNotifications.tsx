import React, { useCallback, useRef, useState } from 'react'
import { Icon, Modal, Table } from 'antd'
import { useEffect } from 'react'
import cn from 'classnames'
import { AxiosError } from 'axios'
import styles from './WsNotifications.less'
import { getDefaultModalBodyHeight } from './WsNotifications.utils'
import markAsReadIcon from './img/markAsRead.svg'
import { useToggle } from '@hooks/useToggle'
import { columns, columnsWithLinks, DEFAULT_MODAL_WIDTH } from './WsNotifications.constants'
import { useTranslation } from 'react-i18next'
import Pagination from './Pagination'
import Button from '../ui/Button/Button'
import { CxBoxApiInstance as instance } from '../../api'
import { useStompNotification } from '@components/WsNotifications/hooks'
import { lastValueFrom } from 'rxjs'

interface NotificationProps {}

/**
 * Do not reuse
 */
export function WsNotifications(props: NotificationProps) {
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
            return lastValueFrom(instance.deleteNotifications(selectedRowKeys)).then(
                () => {
                    setSelectedRowKeys([])
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
                <Pagination />
            </div>
        </div>
    )

    const isLinksEnabled = notification.state.data?.some(message => Array.isArray(message.links))

    return (
        <>
            <Button className={styles.notification} type="bar" onClick={() => toggleModalVisibility(true)}>
                {(notification.state.unreadCount as number) > 0 && <span className={styles.dot}>{notification.state.unreadCount}</span>}
                <Icon type="bell" style={{ marginBottom: '-4px' }} />
            </Button>
            {visible && (
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
                                    columns={isLinksEnabled ? columnsWithLinks : columns}
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
            )}
        </>
    )
}
