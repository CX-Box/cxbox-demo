import React, { forwardRef, ReactElement, useEffect, useRef, useState } from 'react'
import { notification, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { UploadList } from '@components/Operations/components/FileUpload/UploadList'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { isFileUploadSuccess } from '@components/Operations/components/FileUpload/FileUpload.utils'
import { openNotification } from '@components/NotificationsContainer/utils'
import styles from './FileUpload.module.less'

interface UploadListContainerProps {
    addedFileList: AddedFileInfo[]
    onClose: () => void
    title?: string
    successHint?: string
}

export const UploadListContainer = forwardRef(
    ({ title, addedFileList, onClose, successHint, ...dataAttributes }: UploadListContainerProps, ref: React.LegacyRef<HTMLDivElement>) => {
        const { t } = useTranslation()
        const [visibleProgress, setVisibleProgress] = useState(false)
        const progressKey = useRef(`upload-progress_${Date.now()}`)

        // closes an open notification if it is empty
        useEffect(() => {
            if (addedFileList.length === 0 && visibleProgress) {
                notification.close(progressKey.current)
                setVisibleProgress(false)
            }
        }, [addedFileList.length, visibleProgress, addedFileList])

        // hides the notification if the component is unmounted, since access to data will be lost
        useEffect(() => {
            const notificationKey = progressKey.current

            return () => {
                notification.close(notificationKey)
            }
        }, [])

        const message = title ?? t('Upload progress')

        useEffect(() => {
            if (addedFileList.length > 0 && addedFileList.some(file => file.status === 'init') && !visibleProgress) {
                setVisibleProgress(true)
                openNotification({
                    key: progressKey.current,
                    message,
                    description: <div id={progressKey.current}></div>,
                    duration: null,
                    onClose: () => {
                        notification.close(progressKey.current)
                        setVisibleProgress(false)
                        onClose()
                    }
                })
            }
        }, [addedFileList, addedFileList.length, message, onClose, t, visibleProgress])

        const notificationElement = document.body.querySelector(`#${progressKey.current}`)

        let hint: ReactElement | null = null

        if (addedFileList.some(file => isFileUploadSuccess(file.status)) && successHint) {
            hint = (
                <div className={styles.hintWrapper}>
                    <Typography.Text type="secondary">{successHint}</Typography.Text>
                </div>
            )
        }

        return notificationElement
            ? createPortal(
                  <div ref={ref} className={styles.uploadList} {...dataAttributes}>
                      <UploadList fileList={addedFileList} />
                      {hint}
                  </div>,
                  document.body.querySelector(`#${progressKey.current}`) as Element
              )
            : null
    }
)
