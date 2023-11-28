import { useCallback } from 'react'
import { getNotificationCount, getNotificationList, setNotificationsRead } from '../../api/notification'
import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { useAppSelector } from '../useAppSelector'
import { $do } from '../../actions/types'
import { useNotificationClient } from './useNotificationClient'
import { initialState } from '../../reducers/notification'

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
        (page: number, limit: number = initialState.limit) => {
            dispatch($do.changeNotification({ page, limit }))
            getList(page, limit)
        },
        [dispatch, getList]
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
