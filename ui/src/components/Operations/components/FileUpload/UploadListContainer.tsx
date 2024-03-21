import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { notification, Typography } from 'antd'
import styles from './FileUpload.less'
import { useTranslation } from 'react-i18next'
import { UploadList } from '@components/Operations/components/FileUpload/UploadList'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { createPortal } from 'react-dom'
import { isFileDownloadComplete, isFileException } from '@components/Operations/components/FileUpload/FileUpload.utils'

interface UploadListContainerProps {
    addedFileList: AddedFileInfo[]
    onClose?: () => void
    title?: string
    successHint?: string
}

export const UploadListContainer = ({ title, addedFileList, onClose, successHint }: UploadListContainerProps) => {
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

    const message = title ?? t('Upload progress')

    useEffect(() => {
        if (addedFileList.length > 0 && addedFileList.some(file => file.status === 'init') && !visibleProgress) {
            setVisibleProgress(true)
            notification.open({
                key: progressKey.current,
                message,
                description: <div id={progressKey.current}></div>,
                duration: null,
                onClose: () => {
                    notification.close(progressKey.current)
                    setVisibleProgress(false)
                    onClose?.()
                }
            })
        }
    }, [addedFileList, addedFileList.length, message, onClose, t, visibleProgress])

    const notificationElement = document.body.querySelector(`#${progressKey.current}`)

    let hint: ReactElement | null = null

    if (addedFileList.some(file => isFileDownloadComplete(file.status) && !isFileException(file.status)) && successHint) {
        hint = <Typography.Text type="secondary">{successHint}</Typography.Text>
    }

    return notificationElement
        ? createPortal(
              <div className={styles.uploadList}>
                  <UploadList fileList={addedFileList} />
                  {hint}
              </div>,
              document.body.querySelector(`#${progressKey.current}`) as Element
          )
        : null
}
