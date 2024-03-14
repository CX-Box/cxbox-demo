import React, { useEffect, useRef, useState } from 'react'
import { notification } from 'antd'
import styles from './FileUpload.less'
import { useAppDispatch } from '@store'
import { useTranslation } from 'react-i18next'
import { UploadFile } from 'antd/es/upload/interface'
import { WidgetMeta } from '@interfaces/core'
import { UploadList } from '@components/Operations/components/FileUpload/UploadList'
import { needSendAllFiles } from '@components/Operations/components/FileUpload/FileUpload.utils'
import { FileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'
import { createPortal } from 'react-dom'
import Button from '@components/ui/Button/Button'

interface UploadListContainerProps {
    widget: WidgetMeta
    fileList: UploadFile[]
    addedFileList: FileInfo[]
    changeFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
}

export const UploadListContainer = ({ widget, fileList, addedFileList, changeFileList }: UploadListContainerProps) => {
    const { t } = useTranslation()
    const [visibleProgress, setVisibleProgress] = useState(false)
    const progressKey = useRef(`upload-progress_${Date.now()}`)

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (needSendAllFiles(addedFileList) && widget.bcName) {
            setTimeout(() => changeFileList(fileList => fileList.filter(file => file.status === 'error')), 3000)
        }
    }, [dispatch, addedFileList, widget.bcName, changeFileList])

    useEffect(() => {
        if (fileList.length === 0 && visibleProgress) {
            notification.close(progressKey.current)
            setVisibleProgress(false)
        }
    }, [fileList.length, visibleProgress])

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
                }
            })
        }
    }, [addedFileList.length, fileList, t, visibleProgress])

    const notificationElement = document.body.querySelector(`#${progressKey.current}`)

    return notificationElement
        ? createPortal(
              <div className={styles.uploadList}>
                  <UploadList fileList={fileList} />
                  <Button
                      disabled={fileList.some(file => file.status === 'uploading')}
                      onClick={() => {
                          notification.close(progressKey.current)
                          setVisibleProgress(false)
                          changeFileList([])
                      }}
                  >
                      {t('Clear and Close')}
                  </Button>
              </div>,
              document.body.querySelector(`#${progressKey.current}`) as Element
          )
        : null
}
