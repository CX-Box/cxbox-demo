import { randomBytes } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CRYPTOPRO_CONFIG } from '../config'
import { getCadesPlugin } from '../plugin'
import { createFakePlugin, testCertificate, withLineBreaks } from '../testing/fakePlugin'
import { signAttachedAssembled } from './assembled'
import { testCms } from './testing/testCms'

// Inside the directory, so that deleting attachedAssembly removes its tests too

vi.mock('../plugin', async importOriginal => ({
    ...(await importOriginal<typeof import('../plugin')>()),
    getCadesPlugin: vi.fn()
}))

const CHUNK = 6
const config = { ...CRYPTOPRO_CONFIG }

beforeEach(() => {
    Object.assign(CRYPTOPRO_CONFIG, { chunkSize: CHUNK })
})

afterEach(() => {
    Object.assign(CRYPTOPRO_CONFIG, config)
    vi.restoreAllMocks()
})

describe('signAttachedAssembled', () => {
    it.each([true, false])('soft verification continues to CMS structure checks (valid: %s)', async valid => {
        CRYPTOPRO_CONFIG.signatureVerificationMode = 'soft'
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const detached = Buffer.from(testCms({ hash: Buffer.from(valid ? 'AB12CD' : 'FFFFFF', 'hex') })).toString('base64')
        const plugin = createFakePlugin({
            signature: detached,
            failOn: { call: 'VerifyHash', message: 'Verification failed (0x800B010E)' }
        })
        vi.mocked(getCadesPlugin).mockResolvedValue({ cadesplugin: plugin.cadesplugin, version: '2.0.15820' })

        const pending = signAttachedAssembled(new Blob(['Document']), testCertificate())
        if (valid) {
            const result = await pending
            expect(result.method).toBe('assembled')
            expect(result.der.size).toBeGreaterThan(Buffer.from(detached, 'base64').length)
        } else {
            await expect(pending).rejects.toMatchObject({ code: 'INVALID_CMS' })
        }
        expect(plugin.calls.filter(call => call.startsWith('VerifyHash('))).toHaveLength(1)
        expect(warning).toHaveBeenCalledTimes(1)
    })

    it('passes the file to the plugin only in chunks; the plugin verifies only the detached part (VerifyHash, not VerifyCades)', async () => {
        // the fake HashedData.Value is AB12CD, so the detached signature must carry this messageDigest
        const detached = Buffer.from(testCms({ hash: Buffer.from('AB12CD', 'hex') })).toString('base64')
        const plugin = createFakePlugin({ signature: withLineBreaks(detached) })
        vi.mocked(getCadesPlugin).mockResolvedValue({ cadesplugin: plugin.cadesplugin, version: '2.0.15820' })
        const callsOf = (prefix: string) => plugin.calls.filter(call => call.startsWith(prefix))

        const result = await signAttachedAssembled(new Blob([randomBytes(500)]), testCertificate())

        expect(result.method).toBe('assembled')
        expect(callsOf('SignHash')).toHaveLength(1)
        expect(callsOf('VerifyHash')).toHaveLength(1)
        expect([...callsOf('SignCades'), ...callsOf('VerifyCades'), ...callsOf('SignedData.Content')]).toEqual([])
        expect(plugin.hashedChunks.every(chunk => chunk.length <= (CHUNK / 3) * 4)).toBe(true)
    })
})
