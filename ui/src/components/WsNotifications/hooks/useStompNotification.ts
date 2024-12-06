import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { useNotificationClient } from './useNotificationClient'
import { useAppSelector } from '@store'
import { changeNotification } from '@actions'
import { CxBoxApiInstance as instance } from '../../../api'
import { initialState } from '../../../reducers/notification'

export function useStompNotification({ check = false } = {}) {
    const notificationState = useAppSelector(state => state.notification)

    const dispatch = useDispatch()

    const checkNew = useCallback(() => {
        instance
            .checkNewNotification()
            .then(response => {
                dispatch(changeNotification({ unreadCount: response?.data }))
            })
            .catch((error: AxiosError) => {
                console.error('Error when checking for new notifications', error)
            })
    }, [dispatch])

    const getCount = useCallback(() => {
        instance
            .getNotificationCount()
            .then(response => {
                const count = response?.data
                if (count !== null) {
                    dispatch(changeNotification({ count }))
                }
            })
            .catch((error: AxiosError) => {
                console.error('Error while loading notification list', error)
            })
    }, [dispatch])

    const getList = useCallback(
        (page: number = initialState.page, limit: number = initialState.limit) => {
            instance
                .getNotificationList(page, limit)
                .then(response => {
                    if (response?.success) {
                        dispatch(changeNotification({ data: response.data, page, limit }))
                    }
                })
                .catch((error: AxiosError) => {
                    console.error('Error while loading notification list', error)
                })
            getCount()
        },
        [dispatch, getCount]
    )

    const getCurrentPage = useCallback(() => {
        getList(notificationState.page, notificationState.limit)
    }, [getList, notificationState.limit, notificationState.page])

    const setRead = useCallback(
        (selectedRowKeys: (string | number)[]) => {
            instance
                .setNotificationsRead(selectedRowKeys)
                .then(data => {
                    checkNew()
                    getList(notificationState.page, notificationState.limit)
                })
                .catch((error: AxiosError) => {
                    console.error(error)
                })
        },
        [checkNew, getList, notificationState.limit, notificationState.page]
    )

    const changePage = useCallback(
        (page: number, limit: number = initialState.limit) => {
            dispatch(changeNotification({ page, limit }))
            getList(page, limit)
        },
        [dispatch, getList]
    )

    useNotificationClient(messageBody => {
        getList(messageBody.page, messageBody.limit)
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
        setRead,
        getList,
        checkNew,
        getCurrentPage,
        changePage
    }
}
