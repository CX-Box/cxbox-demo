import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CRYPTOPRO_CONFIG } from '../config'
import { CertificateData, SignedCms } from '../types'
import { signAttachedNative } from './native'
import { signAttached } from './signAttached'

vi.mock('./native', () => ({ signAttachedNative: vi.fn() }))
// As after removing the optional module: its index.ts stays and exports no loader
vi.mock('../attachedAssembly', () => ({ loadAttachedAssembly: undefined }))

// Assembly of larger files — attachedAssembly/signAttached.test.ts
const MAX = 10
const cert = {} as CertificateData
const options = { cadesType: 'CADES_BES' as const }
const file = (size: number) => new Blob([new Uint8Array(size)])

describe('signAttached', () => {
    const originalConfig = { ...CRYPTOPRO_CONFIG }

    beforeEach(() => {
        Object.assign(CRYPTOPRO_CONFIG, { nativeAttachedMaxSize: MAX, attachedAssembly: false })
        vi.mocked(signAttachedNative)
            .mockReset()
            .mockResolvedValue({ signature: new Blob(), der: new Blob(), method: 'native' } as SignedCms)
    })

    afterEach(() => {
        Object.assign(CRYPTOPRO_CONFIG, originalConfig)
    })

    it.each([0, MAX])('signs %i B by SignCades of the whole file', async size => {
        const blob = file(size)

        expect((await signAttached(blob, cert, options)).method).toBe('native')
        expect(signAttachedNative).toHaveBeenCalledWith(blob, cert, options)
    })

    it('rejects a larger file with FILE_TOO_LARGE by default, before signing', async () => {
        await expect(signAttached(file(MAX + 1), cert, options)).rejects.toEqual(
            expect.objectContaining({ code: 'FILE_TOO_LARGE', cause: expect.objectContaining({ size: MAX + 1, maxSize: MAX }) })
        )
        expect(signAttachedNative).not.toHaveBeenCalled()
    })

    it.each([1, MAX + 1])(
        'rejects a file of %i B with ASSEMBLY_NOT_AVAILABLE when assembly is on, but the module is removed',
        async size => {
            CRYPTOPRO_CONFIG.attachedAssembly = true
            await expect(signAttached(file(size), cert, options)).rejects.toEqual(
                expect.objectContaining({ code: 'ASSEMBLY_NOT_AVAILABLE' })
            )
            expect(signAttachedNative).not.toHaveBeenCalled()
        }
    )
})
