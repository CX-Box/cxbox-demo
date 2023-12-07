import { useCallback, useEffect, useState } from 'react'
import { checkNewNotification, getNotificationCount, getNotificationList, setNotificationsRead } from '../../api/notification'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { useAppSelector } from '../useAppSelector'
import { $do } from '../../actions/types'
import { useNotificationClient } from './useNotificationClient'
import { initialState } from '../../reducers/notification'

export function useStompNotification({ check = false } = {}) {
    const notificationState = useAppSelector(state => state.notification)

    const dispatch = useDispatch()

    const checkNew = useCallback(() => {
        checkNewNotification()
            .then(response => {
                dispatch($do.changeNotification({ unreadCount: response.data }))
            })
            .catch((error: AxiosError) => {
                console.error('Error when checking for new notifications', error)
            })
    }, [dispatch])

    const getCount = useCallback(() => {
        getNotificationCount()
            .then(response => {
                const count = response.data
                if (count !== null) {
                    dispatch($do.changeNotification({ count }))
                }
            })
            .catch((error: AxiosError) => {
                console.error('Error while loading notification list', error)
            })
    }, [dispatch])

    const getList = useCallback(
        (page: number = initialState.page, limit: number = initialState.limit) => {
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
        [dispatch]
    )

    const getCurrentPage = useCallback(() => {
        getList(notificationState.page, notificationState.limit)
    }, [getList, notificationState.limit, notificationState.page])

    const setRead = useCallback(
        (selectedRowKeys: (string | number)[]) => {
            setNotificationsRead(selectedRowKeys)
                .then(data => {
                    getCount()
                    checkNew()
                    getList(notificationState.page, notificationState.limit)
                })
                .catch((error: AxiosError) => {
                    console.error(error)
                })
        },
        [checkNew, getCount, getList, notificationState.limit, notificationState.page]
    )

    const changePage = useCallback(
        (page: number, limit: number = initialState.limit) => {
            dispatch($do.changeNotification({ page, limit }))
            getList(page, limit)
        },
        [dispatch, getList]
    )

    useNotificationClient(messageBody => {
        getList(messageBody.page, messageBody.limit)
        getCount()
        checkNew()
    })

    const [isInitialization, setIsInitialization] = useState(true)

    useEffect(() => {
        if (check && isInitialization) {
            checkNew()
            setIsInitialization(false)
        }
    }, [check, checkNew, isInitialization])

    return {
        state: notificationState,
        getCount,
        setRead,
        getList,
        checkNew,
        getCurrentPage,
        changePage
    }
}
