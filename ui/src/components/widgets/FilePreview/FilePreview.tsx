import React, { useEffect } from 'react'
import { useAppSelector } from '@store'
import Field from '@components/Field/Field'
import { AppWidgetTableMeta, FileUploadFieldMeta } from '@interfaces/widget'
import { FieldType } from '@cxbox-ui/core'
import styles from './FilePreview.module.css'

interface FilePreviewProps {
    meta: AppWidgetTableMeta
}

const FilePreview: React.FC<FilePreviewProps> = ({ meta }) => {
    const cursor = useAppSelector(state => state.screen.bo.bc[meta.bcName]?.cursor) as string
    const fileField = (meta.fields as FileUploadFieldMeta[]).find(
        field => field.type === FieldType.fileUpload && field.preview?.mode === 'inline'
    )

    useEffect(() => {
        if (meta && !fileField) {
            console.info(`${meta.name} widget: no field with type:'fileUpload' and preview.mode:'inline'`)
        }
    }, [fileField, meta])

    if (!fileField) {
        return null
    }

    return (
        <div
            className={styles.container}
            data-test="FIELD"
            data-test-field-type={fileField.type}
            data-test-field-title={fileField.title}
            data-test-field-key={fileField.key}
        >
            <Field bcName={meta.bcName} cursor={cursor} widgetName={meta.name} widgetFieldMeta={fileField} />
        </div>
    )
}

export default FilePreview
