import React, { DragEventHandler, ReactNode } from 'react'
import { Icon, Upload } from 'antd'
import styles from './FileUpload.less'
import { getFileUploadEndpoint } from '@utils/api'
import { useTranslation } from 'react-i18next'
import { UploadProps } from 'antd/es/upload/interface'
import { OperationInfo } from '@interfaces/widget'
import { WidgetMeta } from '@interfaces/core'
import cn from 'classnames'
import { useBulkUploadFiles, useFileUploadHint } from '@components/Operations/components/FileUpload/FileUpload.hooks'
import { UploadListContainer } from '@components/Operations/components/FileUpload/UploadListContainer'
import {
    checkFileFormat,
    getFilesFromDataTransfer,
    isFileDownloadComplete
} from '@components/Operations/components/FileUpload/FileUpload.utils'
import { UPLOAD_TYPE_ICON } from '@components/Operations/components/FileUpload/FileUpload.constants'
import { useAppSelector } from '@store'
import { buildBcUrl } from '@utils/buildBcUrl'
import { RowMetaField } from '@interfaces/rowMeta'

interface FileUploadProps {
    widget: WidgetMeta
    operationInfo?: OperationInfo
    mode?: 'default' | 'drag'
    children?: ReactNode
    uploadType?: keyof typeof UPLOAD_TYPE_ICON
}

export const FileUpload = ({ mode, widget, operationInfo, children, uploadType = 'create' }: FileUploadProps) => {
    const { t } = useTranslation()
    const uploadUrl = getFileUploadEndpoint()
    const bcName = widget.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const rowMeta = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl])
    const rowMetaField = rowMeta?.fields.find(field => field.key === operationInfo?.fieldKey)
    const fileAccept = (rowMetaField as RowMetaField)?.fileAccept

    const { initializeNewAddedFile, updateAddedFile, getAddedFile, getAddedFileListWithout, clearAddedFiles, initializeNotSupportedFile } =
        useBulkUploadFiles(bcName, fileAccept)

    const commonUploadProps: UploadProps = {
        disabled: rowMetaField ? rowMetaField.disabled : true,
        action: uploadUrl,
        accept: fileAccept,
        showUploadList: false,
        multiple: true,
        beforeUpload: file => {
            if (checkFileFormat(file.name, fileAccept)) {
                initializeNewAddedFile(file.uid, file.name, uploadType)

                return true
            }

            initializeNotSupportedFile(file.name, uploadType)

            return false
        },
        onChange: info => {
            const { uid, status, percent, response } = info.file
            const needUpdatePercents =
                getAddedFile(uid)?.status === 'init' || (!!percent && Math.floor(percent) % 10 === 0 && status === 'uploading')

            if (needUpdatePercents) {
                updateAddedFile(uid, { status, percent })
            }

            if (isFileDownloadComplete(status)) {
                updateAddedFile(uid, { status, percent, id: response?.data?.id ?? null })
            }
        }
    }

    const hintText = useFileUploadHint(fileAccept)

    // Needed to process files with an inappropriate extension. Such files are not included in the beforeUpload and onChange handlers of the Upload component.
    const handleDrop: DragEventHandler<HTMLDivElement> = event => {
        event.preventDefault()
        const files = getFilesFromDataTransfer(event.dataTransfer)

        files
            .filter(file => !checkFileFormat(file.name, fileAccept))
            .forEach(file => {
                initializeNotSupportedFile(file.name)
            })
    }

    return (
        <>
            <div onDrop={handleDrop}>
                {mode === 'drag' ? (
                    <Upload.Dragger {...commonUploadProps} className={styles.root}>
                        <p className={styles.icon}>
                            <Icon type="inbox" />
                        </p>
                        <p className={styles.imitationButton}>{t('Click Here to Select Files')}</p>
                        <p className={cn(styles.text, styles.bold, styles.mr4)}>{t('Or drag files to this area')}</p>
                        <p className={styles.text}>{t('Add at least one file, support for a single or bulk upload')}</p>
                        <p className={styles.hint}>{hintText}</p>
                    </Upload.Dragger>
                ) : (
                    <Upload {...commonUploadProps}>{children}</Upload>
                )}
            </div>
            <UploadListContainer addedFileList={getAddedFileListWithout(['updated'])} onClose={clearAddedFiles} />
        </>
    )
}
