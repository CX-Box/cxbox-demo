import React, { useEffect, useRef, useState } from 'react'
import { notification } from 'antd'
import styles from './FileUpload.less'
import { useTranslation } from 'react-i18next'
import { UploadList } from '@components/Operations/components/FileUpload/UploadList'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { createPortal } from 'react-dom'

interface UploadListContainerProps {
    addedFileList: AddedFileInfo[]
    onClose?: () => void
}

export const UploadListContainer = ({ addedFileList, onClose }: UploadListContainerProps) => {
    const { t } = useTranslation()
    const [visibleProgress, setVisibleProgress] = useState(false)
    const progressKey = useRef(`upload-progress_${Date.now()}`)

    useEffect(() => {
        if (addedFileList.length === 0 && visibleProgress) {
            notification.close(progressKey.current)
            setVisibleProgress(false)
            onClose?.()
        }
    }, [addedFileList.length, onClose, visibleProgress])

    // hides the notification if the component is unmounted, since access to data will be lost
    useEffect(() => {
        const notificationKey = progressKey.current

        return () => {
            notification.close(notificationKey)
        }
    }, [onClose])

    useEffect(() => {
        if (addedFileList.length > 0 && addedFileList.some(file => file.status === 'init') && !visibleProgress) {
            setVisibleProgress(true)
            notification.open({
                key: progressKey.current,
                message: t('Upload progress'),
                description: <div id={progressKey.current}></div>,
                duration: null,
                onClose: () => {
                    notification.close(progressKey.current)
                    setVisibleProgress(false)
                    onClose?.()
                }
            })
        }
    }, [addedFileList, addedFileList.length, onClose, t, visibleProgress])

    const notificationElement = document.body.querySelector(`#${progressKey.current}`)

    return notificationElement
        ? createPortal(
              <div className={styles.uploadList}>
                  <UploadList fileList={addedFileList} />
              </div>,
              document.body.querySelector(`#${progressKey.current}`) as Element
          )
        : null
}
