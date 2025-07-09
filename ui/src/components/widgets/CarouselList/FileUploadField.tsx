import React from 'react'
import ReadOnlySingleFileUpload from '@fields/FileUpload/ReadOnlySingleFileUpload'
import { useAppSelector } from '@store'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { selectBcData, selectBcRecordPendingDataChanges } from '@selectors/selectors'
import { applyParams, getFileUploadEndpoint } from '@utils/api'
import { useFileIconClick } from '@fields/FileUpload/FileUploadContainer'

interface FileUploadFieldProps {
    id: string
    widgetName: string
    bcName: string
    widgetField: FileUploadFieldMeta
    width: number
    height: number
    disabledViewer?: boolean
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({ widgetName, bcName, id, widgetField, width, height, disabledViewer }) => {
    const { key: fieldName, fileIdKey, fileSource = '', preview } = widgetField || {}

    const pendingDataChanges = useAppSelector(state => selectBcRecordPendingDataChanges(state, bcName, id))
    const currentRecord = useAppSelector(state => selectBcData(state, bcName)?.find(item => item.id === id))

    const getDownloadUrl = (params: { id: string; source: string }) => {
        return params.id ? applyParams(getFileUploadEndpoint(), params) : undefined
    }
    const getFieldValue = (fieldKey: string | undefined) => {
        if (!fieldKey) {
            return
        }

        return pendingDataChanges?.[fieldKey] !== undefined ? pendingDataChanges?.[fieldKey] : currentRecord?.[fieldKey]
    }

    const fileName = getFieldValue(fieldName)
    const fileId = getFieldValue(fileIdKey)

    const downloadUrl = getDownloadUrl({
        source: fileSource,
        id: fileId?.toString() as string
    })

    const handleFileIconClick = useFileIconClick(widgetName, bcName, id, fieldName as string)

    return (
        <ReadOnlySingleFileUpload
            fileName={fileName as string}
            downloadUrl={downloadUrl}
            width={width}
            height={height}
            mode={preview?.mode}
            onFileIconClick={preview?.enabled && !disabledViewer ? handleFileIconClick : undefined}
        />
    )
}

export default React.memo(FileUploadField)
