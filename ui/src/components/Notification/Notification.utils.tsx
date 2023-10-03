import React from 'react'
import { DEFAULT_MODAL_BODY_HEIGHT, DEFAULT_MODAL_HEIGHT } from './Notification.constants'

export const getDefaultModalBodyHeight = (modalContainerRef: React.MutableRefObject<any>) => {
    const headerHeight = modalContainerRef?.current?.querySelector('.ant-modal-header')?.offsetHeight
    const footerHeight = modalContainerRef?.current?.querySelector('.ant-modal-footer')?.offsetHeight

    if (!headerHeight || !footerHeight) {
        return DEFAULT_MODAL_BODY_HEIGHT
    }
    return DEFAULT_MODAL_HEIGHT - headerHeight - footerHeight
}
