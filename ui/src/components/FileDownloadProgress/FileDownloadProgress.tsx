import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@store'
import { UploadListContainer } from '@components/Operations/components/FileUpload/UploadListContainer'
import { useAutoRemoveSuccessFiles } from '@components/Operations/components/FileUpload/FileUpload.hooks'
import { UPLOAD_FILE_STATUS } from '@components/Operations/components/FileUpload/FileUpload.constants'
import { fileDownloadActions } from '../../slices/fileDownload'

/**
 * The "Download progress" window: a line for each file that the user downloads, as in the "Upload progress" window
 */
function FileDownloadProgress() {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const files = useAppSelector(state => state.fileDownload)

    const removeFiles = useCallback((uidList: string[]) => dispatch(fileDownloadActions.removeFiles(uidList)), [dispatch])
    const clearFiles = useCallback(() => dispatch(fileDownloadActions.clearFiles()), [dispatch])
    const callbackRef = useAutoRemoveSuccessFiles(files, removeFiles)

    // the tooltip of a line: the reason of an error comes from the server, the rest is the status
    const lines = useMemo(() => {
        const statusInformation: Partial<Record<string, string>> = {
            [UPLOAD_FILE_STATUS.done]: t('Success. File downloaded'),
            [UPLOAD_FILE_STATUS.error]: t('Error. File not downloaded')
        }

        return files.map(file => ({ ...file, statusInformation: statusInformation[file.status] }))
    }, [files, t])

    return (
        <UploadListContainer
            ref={callbackRef}
            title={t('Download progress')}
            direction="download"
            addedFileList={lines}
            onClose={clearFiles}
            data-test-notification-inner-container={true}
            data-test-notification-for-download={true}
        />
    )
}

export default React.memo(FileDownloadProgress)
