import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosResponse, CanceledError, InternalAxiosRequestConfig } from 'axios'
import { FILE_RETRY_DELAY_MS, fileRequestLabel, isFileDownloadUrl, withFileRetry } from './fileRequestRetry'

const httpError = (status: number) =>
    new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_RESPONSE, undefined, undefined, {
        status,
        statusText: '',
        data: null,
        headers: {},
        config: {} as InternalAxiosRequestConfig
    } as AxiosResponse)

const codeError = (code: string) => new AxiosError(code, code)

describe('isFileDownloadUrl', () => {
    it.each(['http://localhost/api/v1/file?source=X&id=1', '/api/v1/file?id=1', '/api/v1/file/?id=1', '/file?id=1'])(
        '%s — file download',
        url => {
            expect(isFileDownloadUrl(url)).toBe(true)
        }
    )

    it.each([
        '/api/v1/files/x',
        '/api/v1/report?file=1',
        '/api/v1/file/abc-link',
        '/api/v1/data/file-list',
        'http://[/file',
        'https://other.example/api/v1/file?id=1'
    ])('%s — not a file download', url => {
        expect(isFileDownloadUrl(url)).toBe(false)
    })
})

describe('fileRequestLabel', () => {
    it('keeps the path and id only', () => {
        expect(fileRequestLabel('http://host/api/v1/file?source=X&id=1&access_token=secret')).toBe('/api/v1/file?id=1')
        expect(fileRequestLabel('/api/v1/file?preview=true')).toBe('/api/v1/file')
        expect(fileRequestLabel('/api/v1/file?id=a%0Ab')).toBe('/api/v1/file?id=a%0Ab')
    })
})

describe('withFileRetry', () => {
    let warn: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        vi.useFakeTimers()
        warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it.each([
        ['502', httpError(502)],
        ['503', httpError(503)],
        ['504', httpError(504)],
        ['network error', codeError(AxiosError.ERR_NETWORK)]
    ])('%s: one retry after the pause, then the result', async (_, error) => {
        const request = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('file')

        const result = withFileRetry(request, '/api/v1/file?id=1')
        await vi.advanceTimersByTimeAsync(FILE_RETRY_DELAY_MS - 1)
        expect(request).toHaveBeenCalledTimes(1)
        await vi.advanceTimersByTimeAsync(1)
        expect(request).toHaveBeenCalledTimes(2)

        await expect(result).resolves.toBe('file')
        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn).toHaveBeenCalledWith('[file retry]', '/api/v1/file?id=1', error.response?.status ?? error.code, 'attempt 2/2')
    })

    it('both attempts fail: the error of the second attempt', async () => {
        const first = httpError(502)
        const second = httpError(502)
        const request = vi.fn().mockRejectedValueOnce(first).mockRejectedValueOnce(second)

        const result = expect(withFileRetry(request, '/api/v1/file?id=1')).rejects.toBe(second)
        await vi.advanceTimersByTimeAsync(FILE_RETRY_DELAY_MS)
        await result

        expect(request).toHaveBeenCalledTimes(2)
        expect(warn).toHaveBeenCalledTimes(1)
    })

    it.each([
        ['404', httpError(404)],
        ['401', httpError(401)],
        ['500', httpError(500)],
        ['axios timeout', codeError(AxiosError.ECONNABORTED)],
        ['cancel', new CanceledError()],
        ['reject without an error', undefined],
        ['not an axios error', new TypeError('boom')]
    ])('%s: no retry', async (_, error) => {
        const request = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('file')

        const result = expect(withFileRetry(request, '/api/v1/file?id=1')).rejects.toBe(error)
        await vi.advanceTimersByTimeAsync(FILE_RETRY_DELAY_MS * 2)
        await result

        expect(request).toHaveBeenCalledTimes(1)
        expect(warn).not.toHaveBeenCalled()
    })

    it('success at once: one request, no warn', async () => {
        const request = vi.fn().mockResolvedValueOnce('file')

        await expect(withFileRetry(request, '/api/v1/file?id=1')).resolves.toBe('file')

        expect(request).toHaveBeenCalledTimes(1)
        expect(warn).not.toHaveBeenCalled()
    })
})
