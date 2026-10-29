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
})

describe('signAttachedAssembled', () => {
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
