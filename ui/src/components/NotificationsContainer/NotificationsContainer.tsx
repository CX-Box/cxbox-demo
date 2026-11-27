import React, { useEffect, useRef } from 'react'
import { notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { allNotificationsClosed } from '@actions'
import { useAppDispatch } from '@store'
import Button from '@components/ui/Button/Button'
import { directionItems, EDirection, notifications, notificationsContainerId } from '@components/NotificationsContainer/constants'
import styles from './NotificationsContainer.module.css'

const isUpward = directionItems === EDirection.upward

export const NotificationsContainer = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const containerRef = useRef<HTMLDivElement>(null)

    const handleCloseAll = () => {
        notification.destroy()
        notifications.clear()
        dispatch(allNotificationsClosed())
    }

    useEffect(() => {
        const checkNotifications = () => {
            if (!containerRef?.current) {
                return
            }
            const stackNotifications = Array.from(containerRef.current.querySelectorAll(`.${CSS.escape(styles.stack)}`)) as HTMLElement[]
            const notificationsLength = stackNotifications.length

            if (!!notificationsLength) {
                const visibleNotificationIndex = isUpward ? 0 : notificationsLength - 1

                if (notificationsLength >= 1) {
                    stackNotifications.forEach((el, index) => (el.style.display = index === visibleNotificationIndex ? 'initial' : 'none'))
                }

                if (notificationsLength === 1) {
                    stackNotifications[visibleNotificationIndex].style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }

                if (notificationsLength === 2) {
                    stackNotifications[visibleNotificationIndex].style.boxShadow =
                        '0 4px 12px rgba(0, 0, 0, 0.15), 0 10px 0 -1px white, 0 12px 6px -2px rgba(0, 0, 0, 0.15)'
                }

                if (notificationsLength > 2) {
                    stackNotifications[visibleNotificationIndex].style.boxShadow =
                        '0 4px 12px rgba(0, 0, 0, 0.15), 0 10px 0 -1px white, 0 12px 6px -2px rgba(0, 0, 0, 0.15), 0 20px 0 -2px white, 0 20px 10px 3px rgba(0, 0, 0, 0.15)'
                }
            }
        }

        checkNotifications()
        const observer = new MutationObserver(checkNotifications)
        if (containerRef?.current) {
            observer.observe(containerRef.current, { childList: true, subtree: true })
        }

        return () => observer.disconnect()
    }, [])

    return (
        <div ref={containerRef} className={styles.container} id={notificationsContainerId}>
            <Button className={styles.closeAllButton} type="link" onClick={handleCloseAll}>
                {t('Close all')}
            </Button>
        </div>
    )
}

export default NotificationsContainer
