import { useCallback } from 'react'
import { getNotificationCount, getNotificationList, setNotificationsRead } from '../../api/notification'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { useAppSelector } from '../useAppSelector'
import { $do } from '../../actions/types'
import { useNotificationClient } from './useNotificationClient'

export function useStompNotification() {
    const notificationState = useAppSelector(state => state.notification)

    const dispatch = useDispatch()

    const getCount = useCallback(() => {
        getNotificationCount()
            .then(response => {
                const data = response.data
                if (data !== null) {
                    dispatch($do.changeNotification({ count: data }))
                }
            })
            .catch((error: AxiosError) => {
                console.error('Error while loading notification list', error)
            })
    }, [dispatch])

    const getList = useCallback(
        (page: number = notificationState.page, limit: number = notificationState.limit) => {
            getNotificationList(page, limit)
                .then(response => {
                    if (response.success) {
                        dispatch($do.changeNotification({ data: response.data }))
                    }
                })
                .catch((error: AxiosError) => {
                    console.error('Error while loading notification list', error)
                })
        },
        [dispatch, notificationState.limit, notificationState.page]
    )

    const getCurrentPage = useCallback(() => {
        getList()
    }, [getList])

    const setRead = useCallback(
        (selectedRowKeys: (string | number)[]) => {
            setNotificationsRead(selectedRowKeys)
                .then(data => {
                    getCount()
                    getList(notificationState.page, notificationState.limit)
                })
                .catch((error: AxiosError) => {
                    console.error(error)
                })
        },
        [getCount, getList, notificationState.limit, notificationState.page]
    )

    const changePage = useCallback(
        (page: number, limit: number = notificationState.limit) => {
            dispatch($do.changeNotification({ page, limit }))
            getList(page, limit)
        },
        [dispatch, getList, notificationState.limit]
    )

    useNotificationClient(messageBody => {
        getList(messageBody.page, messageBody.limit)
        getCount()
    })

    return {
        state: notificationState,
        getCount,
        setRead,
        getList,
        getCurrentPage,
        changePage
    }
}
