import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { notification, Typography } from 'antd'
import styles from './FileUpload.less'
import { useTranslation } from 'react-i18next'
import { UploadList } from '@components/Operations/components/FileUpload/UploadList'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { createPortal } from 'react-dom'
import { isFileUploadSuccess } from '@components/Operations/components/FileUpload/FileUpload.utils'
import { useHover } from '@hooks/useHover'

interface UploadListContainerProps {
    addedFileList: AddedFileInfo[]
    onClose: () => void
    onRemove: (uidList: string[]) => void
    title?: string
    successHint?: string
}

export const UploadListContainer = ({
    title,
    addedFileList,
    onRemove,
    onClose,
    successHint,
    ...dataAttributes
}: UploadListContainerProps) => {
    const { t } = useTranslation()
    const [visibleProgress, setVisibleProgress] = useState(false)
    const progressKey = useRef(`upload-progress_${Date.now()}`)
    const [callbackRef, isHovering] = useHover<HTMLDivElement>()
    const timeoutIdList = useRef<NodeJS.Timeout[]>([])

    useEffect(() => {
        if (addedFileList.length === 0 && visibleProgress) {
            notification.close(progressKey.current)
            setVisibleProgress(false)
        }
    }, [addedFileList.length, visibleProgress, isHovering, addedFileList])

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null
        const uidListForDeletion = addedFileList.filter(file => file.status === 'done').map(file => file.uid)

        if (uidListForDeletion.length && !isHovering) {
            timeoutId = setTimeout(() => {
                onRemove(uidListForDeletion)
                timeoutId && timeoutIdList.current.filter(id => id !== timeoutId)
            }, 5000)

            timeoutId && timeoutIdList.current.push(timeoutId)
        }
    }, [addedFileList, isHovering, onRemove])

    useEffect(() => {
        if (isHovering) {
            timeoutIdList.current.forEach(timeoutId => clearTimeout(timeoutId))
            timeoutIdList.current = []
        }
    }, [isHovering])

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
            notification.open({
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
        hint = <Typography.Text type="secondary">{successHint}</Typography.Text>
    }

    return notificationElement
        ? createPortal(
              <div ref={callbackRef} className={styles.uploadList} {...dataAttributes}>
                  <UploadList fileList={addedFileList} />
                  {hint}
              </div>,
              document.body.querySelector(`#${progressKey.current}`) as Element
          )
        : null
}
