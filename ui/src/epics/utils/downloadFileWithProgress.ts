import { AnyAction, nanoid } from '@reduxjs/toolkit'
import { catchError, EMPTY, Observable } from 'rxjs'
import { utils } from '@cxbox-ui/core'
import { AxiosError } from 'axios'
import { isAuthErrorStatus } from '../../auth/authErrorStatus'
import { CxBoxApiInstance } from '../../api'
import { fileDownloadActions } from '../../slices/fileDownload'
import { getFileNameFromDisposition } from '@utils/getFileNameFromDisposition'
import { processFileUploadErrorMessage } from '@components/Operations/components/FileUpload/FileUpload.utils'

// A file downloaded by id or by the url of an action gets its name only with the headers of the answer
const getFileNameFromHeaders = (request?: XMLHttpRequest) =>
    getFileNameFromDisposition(request?.getResponseHeader('content-disposition') ?? '')

/**
 * Downloads the file and shows it in the "Download progress" window. The line appears at once, shows the received part
 * of the file, then turns green when the browser gets the file or red on an error.
 *
 * An error is shown as in the upload: the line is red, the tooltip has the reason, no popup.
 * Only 401 and 403 go further: the session ended for every request, not for this file.
 */
export const downloadFileWithProgress = (api: typeof CxBoxApiInstance, url: string, name?: string) =>
    new Observable<AnyAction>(subscriber => {
        const uid = nanoid()
        let fileName = name ?? ''
        // no step yet: the first event of the answer always updates the line
        let percentStep = -1

        subscriber.next(fileDownloadActions.addFile({ uid, name: fileName }))
        api.saveBlob(url, name, event => {
            const percent = Math.round((event.progress ?? 0) * 100)
            const nameFromHeaders = fileName ? undefined : getFileNameFromHeaders(event.event?.target)

            // the line moves in steps of 10%, as in the upload window; a retry after 502 starts the line again
            if (nameFromHeaders || Math.floor(percent / 10) !== percentStep) {
                fileName = fileName || nameFromHeaders || ''
                percentStep = Math.floor(percent / 10)
                subscriber.next(fileDownloadActions.updateFile({ uid, name: fileName, status: 'uploading', percent }))
            }
        }).then(
            response => {
                fileName = fileName || getFileNameFromHeaders(response.request) || ''
                subscriber.next(fileDownloadActions.updateFile({ uid, name: fileName, status: 'done', percent: 100 }))
                subscriber.complete()
            },
            error => {
                subscriber.next(
                    fileDownloadActions.updateFile({ uid, status: 'error', errorMessage: processFileUploadErrorMessage(error) })
                )
                subscriber.error(error)
            }
        )
    }).pipe(catchError((error: AxiosError) => (isAuthErrorStatus(error.response?.status) ? utils.createApiErrorObservable(error) : EMPTY)))
