import React, { useEffect } from 'react'
import { useAppSelector } from '@store'
import Field from '@features/Field/Field'
import { FileUploadFieldMeta } from '@interfaces/widget'
import { FieldType } from '@cxbox-ui/core'
import styles from './FilePreview.module.css'
import FieldBaseThemeWrapper from '@components/FieldBaseThemeWrapper/FieldBaseThemeWrapper'
import { WidgetComponentType } from '@features/Widget'
import FilePreviewCard from '@components/FilePreviewCard/FilePreviewCard'
import WidgetLoader from '@components/WidgetLoader'

const FilePreview: WidgetComponentType = ({ widgetMeta, mode }) => {
    const cursor = useAppSelector(state => state.screen.bo.bc[widgetMeta.bcName]?.cursor) as string
    const fileField = (widgetMeta.fields as FileUploadFieldMeta[]).find(
        field => field.type === FieldType.fileUpload && field.preview?.mode === 'inline'
    )

    useEffect(() => {
        if (widgetMeta && !fileField) {
            console.info(`${widgetMeta.name} widget: no field with type:'fileUpload' and preview.mode:'inline'`)
        }
    }, [fileField, widgetMeta])

    return (
        <WidgetLoader widgetMeta={widgetMeta} mode={mode}>
            <FilePreviewCard widgetMeta={widgetMeta} mode={mode}>
                {!fileField ? null : (
                    <FieldBaseThemeWrapper
                        className={styles.container}
                        data-test="FIELD"
                        data-test-field-type={fileField.type}
                        data-test-field-title={fileField.title}
                        data-test-field-key={fileField.key}
                    >
                        <Field bcName={widgetMeta.bcName} cursor={cursor} widgetName={widgetMeta.name} widgetFieldMeta={fileField} />
                    </FieldBaseThemeWrapper>
                )}
            </FilePreviewCard>
        </WidgetLoader>
    )
}

export default FilePreview
