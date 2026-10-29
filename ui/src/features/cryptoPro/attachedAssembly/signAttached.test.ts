import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { signAttached } from '../attached'
import { signAttachedNative } from '../attached/native'
import { CRYPTOPRO_CONFIG } from '../config'
import { CertificateData, SignedCms } from '../types'
import { signAttachedAssembled } from './assembled'

vi.mock('../attached/native', () => ({ signAttachedNative: vi.fn() }))
vi.mock('./assembled', () => ({ signAttachedAssembled: vi.fn() }))

const MAX = 10
const cert = {} as CertificateData
const options = { cadesType: 'CADES_BES' as const }
const file = (size: number) => new Blob([new Uint8Array(size)])
const result = (method: SignedCms['method']): SignedCms => ({ signature: new Blob(), der: new Blob(), method })

describe('signAttached with REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY=true', () => {
    const config = { ...CRYPTOPRO_CONFIG }

    beforeEach(() => {
        Object.assign(CRYPTOPRO_CONFIG, { nativeAttachedMaxSize: MAX, attachedAssembly: true })
        vi.mocked(signAttachedNative).mockReset().mockResolvedValue(result('native'))
        vi.mocked(signAttachedAssembled).mockReset().mockResolvedValue(result('assembled'))
    })

    afterEach(() => {
        Object.assign(CRYPTOPRO_CONFIG, config)
    })

    it.each([0, MAX, MAX + 1])('assembles a file of %i B from a detached signature: one way for every size', async size => {
        const blob = file(size)

        expect((await signAttached(blob, cert, options)).method).toBe('assembled')
        expect(signAttachedAssembled).toHaveBeenCalledWith(blob, cert, options)
        expect(signAttachedNative).not.toHaveBeenCalled()
    })
})
