import { useAppSelector } from '@store'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { actions, interfaces } from '@cxbox-ui/core'

/**
 * This hook is responsible for displaying application notifications.
 * Associated with two actions: addNotification, removeNotifications.
 *
 * Logic:
 * After adding a notification to the global state,
 * it checks whether they have been used and if not, they are saved locally.
 * After we have saved them, we will run a hook that will delete all used notifications (locally and globally).
 *
 * In the period after adding and before deleting, the user will have access to all the necessary notifications for display.
 *
 */
export function useNotifications() {
    const notifications = useAppSelector(state => state.session.notifications)
    const featureSettings = useAppSelector(state => state.session.featureSettings)
    const timeoutSetting = featureSettings?.find(setting => setting?.key === 'timeoutShowMessage')
    const notificationsDuration = timeoutSetting ? Math.floor(Number(timeoutSetting.value) / 1000) : 0
    const [currentNotifications, setCurrentNotifications] = useState<typeof notifications>([])

    useEffect(() => {
        if (notifications.length) {
            setCurrentNotifications(getUnusedNotifications(notifications, currentNotifications))
        }
    }, [currentNotifications, notifications])

    const dispatch = useDispatch()

    const removeNotifications = useCallback(
        (notificationKeys: string[]) => {
            dispatch(actions.removeNotifications(notificationKeys))
            setCurrentNotifications([])
        },
        [dispatch]
    )

    useEffect(() => {
        if (currentNotifications.length) {
            removeNotifications(currentNotifications.map(item => item.key))
        }
    }, [currentNotifications, removeNotifications])

    return {
        currentNotifications,
        notificationsDuration
    }
}

const getUnusedNotifications = (newNotifications: interfaces.Notification[], currentNotifications: interfaces.Notification[]) => {
    return newNotifications.filter(
        newNotification => !currentNotifications.find(currentNotification => currentNotification.key === newNotification.key)
    )
}
