import { afterEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { processFileUploadErrorMessage } from './FileUpload.utils'
import { OperationError } from '@interfaces/operation'

const uploadError = (status: number, data?: Partial<OperationError> | string) =>
    new AxiosError<OperationError>(`Request failed with status code ${status}`, AxiosError.ERR_BAD_RESPONSE, undefined, undefined, {
        status,
        statusText: '',
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig,
        data
    } as AxiosResponse<OperationError>)

describe('processFileUploadErrorMessage', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('takes errorMessage of the answer', () => {
        expect(processFileUploadErrorMessage(uploadError(500, { errorMessage: 'The storage is not available' }))).toBe(
            'The storage is not available'
        )
    })

    it('puts each message of the popup on its own line, then errorMessage', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const error = uploadError(418, {
            errorMessage: 'Last',
            error: { popup: ['First', 'Second'] } as OperationError['error']
        })

        expect(processFileUploadErrorMessage(error)).toBe('First\nSecond\nLast')
    })

    it('gives an empty text when the answer has no error of the application (502 of a proxy, network error)', () => {
        expect(processFileUploadErrorMessage(uploadError(502, '<html><body>502 Bad Gateway</body></html>'))).toBe('')
        expect(processFileUploadErrorMessage(new AxiosError('Network Error', AxiosError.ERR_NETWORK))).toBe('')
    })
})
