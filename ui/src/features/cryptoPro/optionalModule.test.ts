import { describe, expect, it } from 'vitest'
import { loadOptionalModule } from './optionalModule'

const codes = { missing: 'ASSEMBLY_NOT_AVAILABLE', failed: 'SIGN_FAILED' } as const

describe('loadOptionalModule', () => {
    it('returns the loaded module', async () => {
        const module = { run: () => 'ok' }
        await expect(loadOptionalModule(async () => module, 'test', codes)).resolves.toBe(module)
    })

    it('rejects with the missing code when the module is removed', async () => {
        await expect(loadOptionalModule(undefined, 'test', codes)).rejects.toEqual(
            expect.objectContaining({ code: 'ASSEMBLY_NOT_AVAILABLE', message: expect.stringContaining('test module is not included') })
        )
    })

    it('rejects with the failed code and the cause when the chunk is not loaded', async () => {
        const loadError = new Error('Loading chunk 271 failed')
        await expect(loadOptionalModule(() => Promise.reject(loadError), 'test', codes)).rejects.toEqual(
            expect.objectContaining({ code: 'SIGN_FAILED', cause: loadError })
        )
    })
})
