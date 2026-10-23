import { randomBytes } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import {
    Base64TextBuilder,
    base64ToBytes,
    blobToBase64,
    blobToBase64TextBlob,
    dataUrlToBase64,
    DEFAULT_CHUNK_SIZE,
    FileTooLargeError,
    forEachBase64Chunk,
    validateSize
} from '@features/file'

const CHUNK = DEFAULT_CHUNK_SIZE

const SIZES: Record<string, number> = {
    '0 B': 0,
    '1 B': 1,
    '2 B': 2,
    '3 B': 3,
    '4 B': 4,
    'chunk - 1': CHUNK - 1,
    chunk: CHUNK,
    'chunk + 1': CHUNK + 1,
    '2 chunks + 2': 2 * CHUNK + 2
}

async function chunksOf(bytes: Uint8Array, size = CHUNK) {
    const chunks: { chunk: string; isLast: boolean }[] = []
    const count = await forEachBase64Chunk(new Blob([bytes]), size, (chunk, isLast) => {
        chunks.push({ chunk, isLast })
    })
    return { chunks, count }
}

describe('forEachBase64Chunk', () => {
    it('DEFAULT_CHUNK_SIZE is 3 MiB, a multiple of 3', () => {
        expect(CHUNK).toBe(3 * 1024 * 1024)
        expect(CHUNK % 3).toBe(0)
    })

    it.each(Object.entries(SIZES))('%s: joined chunks are the base64 of the file, isLast only on the last one', async (_, size) => {
        const bytes = randomBytes(size)
        const { chunks, count } = await chunksOf(bytes)
        expect(count).toBe(Math.max(1, Math.ceil(size / CHUNK)))
        expect(chunks.map(c => c.isLast)).toEqual(chunks.map((_, i) => i === count - 1))
        expect(chunks.map(c => c.chunk).join('')).toBe(bytes.toString('base64'))
        chunks.slice(0, -1).forEach(c => expect(c.chunk).not.toContain('='))
    })

    it('gives one empty last chunk for an empty file', async () => {
        const { chunks } = await chunksOf(new Uint8Array(0))
        expect(chunks).toEqual([{ chunk: '', isLast: true }])
    })

    it('reads the next chunk only after the handler has finished', async () => {
        const events: string[] = []
        await forEachBase64Chunk(new Blob([randomBytes(9)]), 3, async chunk => {
            events.push(`start ${chunk}`)
            await new Promise(resolve => setTimeout(resolve, 5))
            events.push(`end ${chunk}`)
        })
        expect(events).toHaveLength(6)
        for (let i = 0; i < events.length; i += 2) {
            expect([events[i].split(' ')[0], events[i + 1].split(' ')[0]]).toEqual(['start', 'end'])
        }
    })

    it('stops reading when the handler fails', async () => {
        let calls = 0
        await expect(
            forEachBase64Chunk(new Blob([randomBytes(9)]), 3, () => {
                calls++
                if (calls === 2) {
                    throw new Error('part failed')
                }
            })
        ).rejects.toThrow('part failed')
        expect(calls).toBe(2)
    })

    it.each([0, -3, 4, 1.5, NaN])('rejects chunk size %s with RangeError', async size => {
        await expect(forEachBase64Chunk(new Blob([]), size, () => {})).rejects.toThrow(RangeError)
    })
})

describe('blobToBase64TextBlob', () => {
    it.each(Object.entries(SIZES))('%s: the text is the base64 of the file', async (_, size) => {
        const bytes = randomBytes(size)
        const text = await blobToBase64TextBlob(new Blob([bytes]))
        expect(text.type).toBe('application/octet-stream')
        expect(await text.text()).toBe(bytes.toString('base64'))
    })
})

describe('Base64TextBuilder', () => {
    it.each([[[]], [[0]], [[1]], [[2]], [[1, 1, 1]], [[5, 0, 7, 1]], [[3, 3]], [[CHUNK + 1, 2, CHUNK - 1]], [[1000, 1, 1, 1000]]])(
        'pieces %j: the text is the base64 of all pieces, "=" only at the end',
        async (sizes: number[]) => {
            const pieces = sizes.map(size => randomBytes(size))
            const builder = new Base64TextBuilder()
            for (const piece of pieces) {
                await builder.append(new Uint8Array(piece))
            }
            const text = await (await builder.toBlob()).text()
            expect(text).toBe(Buffer.concat(pieces).toString('base64'))
            expect(text.replace(/=+$/, '')).not.toContain('=')
        }
    )
})

describe('blobToBase64', () => {
    it('returns "" for an empty Blob without reading it', async () => {
        const readAsDataURL = vi.spyOn(FileReader.prototype, 'readAsDataURL')
        expect(await blobToBase64(new Blob([]))).toBe('')
        expect(readAsDataURL).not.toHaveBeenCalled()
        readAsDataURL.mockRestore()
    })

    it('fails on a data URL without ";base64," instead of returning garbage', async () => {
        // a reader that returns a data URL without data
        const readAsDataURL = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
            Object.defineProperty(this, 'result', { value: 'data:' })
            setTimeout(() => this.onload?.({} as ProgressEvent<FileReader>))
        })
        await expect(blobToBase64(new Blob([new Uint8Array(3)]))).rejects.toThrow(/without base64/)
        readAsDataURL.mockRestore()
    })

    it('is reversed by base64ToBytes; the Blob type does not affect the result', async () => {
        const bytes = randomBytes(1000)
        const base64 = await blobToBase64(new Blob([bytes], { type: 'text/plain;charset=utf-8' }))
        expect(base64).toBe(bytes.toString('base64'))
        expect(Buffer.from(base64ToBytes(base64))).toEqual(bytes)
        expect(base64ToBytes('')).toEqual(new Uint8Array(0))
    })
})

describe('dataUrlToBase64', () => {
    it('returns the data after the header', () => {
        expect(dataUrlToBase64('data:application/octet-stream;base64,AQID')).toBe('AQID')
        expect(dataUrlToBase64('data:;base64,AQID')).toBe('AQID')
    })

    it('does not take a ";base64," inside the media type for the data start', () => {
        expect(dataUrlToBase64('data:text/plain;base64,x;base64,AQID')).toBe('AQID')
        expect(dataUrlToBase64('data:text/plain;name="a,b";base64,AQID')).toBe('AQID')
    })

    it.each(['data:', 'data:text/plain,abc', 'AQID', ''])('rejects "%s" without base64 data', dataUrl => {
        expect(() => dataUrlToBase64(dataUrl)).toThrow(/without base64/)
    })

    it('reads a Blob whose type contains ";base64," as the file bytes', async () => {
        const bytes = randomBytes(9)
        expect(await blobToBase64(new Blob([bytes], { type: 'text/plain;base64,x' }))).toBe(bytes.toString('base64'))
    })
})

describe('base64ToBytes', () => {
    it('ignores the plugin line breaks', () => {
        const bytes = randomBytes(200)
        const withBreaks = bytes.toString('base64').replace(/.{76}/g, '$&\r\n')
        expect(Buffer.from(base64ToBytes(withBreaks))).toEqual(bytes)
    })

    it.each([0, 1, 2, 3, 4, 5])('decodes %i bytes with and without "=" padding', size => {
        const bytes = randomBytes(size)
        const base64 = bytes.toString('base64')
        expect(Buffer.from(base64ToBytes(base64))).toEqual(bytes)
        expect(Buffer.from(base64ToBytes(base64.replace(/=+$/, '')))).toEqual(bytes)
    })

    it.each(['AQ-_', 'A', 'AQI*', 'АБВГ'])('throws on "%s" instead of returning wrong bytes', base64 => {
        expect(() => base64ToBytes(base64)).toThrow()
    })
})

describe('validateSize', () => {
    it('accepts the limit itself', () => {
        expect(() => validateSize(new Blob([new Uint8Array(10)]), 10)).not.toThrow()
    })

    it('throws FileTooLargeError with sizes above the limit', () => {
        const validate = () => validateSize(new Blob([new Uint8Array(10)]), 9)
        expect(validate).toThrow(FileTooLargeError)
        expect(validate).toThrow(expect.objectContaining({ code: 'FILE_TOO_LARGE', size: 10, maxSize: 9 }))
    })
})
