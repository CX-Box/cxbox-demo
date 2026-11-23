import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.resetModules()
})

describe('CryptoPro settings', () => {
    it.each(['constants', 'config', 'index'])('initializes settings when %s is imported first', async firstModule => {
        vi.resetModules()
        vi.stubEnv('REACT_APP_CRYPTOPRO_SIGNATURE_VERIFICATION_MODE', 'soft')
        vi.stubEnv('REACT_APP_CRYPTOPRO_TSA_URL', 'http://tsa.test')
        vi.stubEnv('REACT_APP_CRYPTOPRO_INSTRUCTION_LINK', 'https://instructions.test/setup')
        vi.stubEnv('REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY', 'true')
        if (firstModule === 'constants') {
            await import('./constants')
        } else if (firstModule === 'config') {
            await import('./config')
        } else {
            await import('./index')
        }
        const { CRYPTOPRO_CONFIG } = await import('./config')
        const { DEFAULT_SIGNATURE_VERIFICATION_MODE } = await import('./constants')
        const { CRYPTOPRO_LINKS: exportedLinks } = await import('./index')
        const { CRYPTOPRO_LINKS } = await import('./links')
        expect(DEFAULT_SIGNATURE_VERIFICATION_MODE).toBe('strict')
        expect(CRYPTOPRO_CONFIG.signatureVerificationMode).toBe('soft')
        expect(CRYPTOPRO_CONFIG.tsaUrl).toBe('http://tsa.test')
        expect(CRYPTOPRO_LINKS.instructionUrl).toBe('https://instructions.test/setup')
        expect(CRYPTOPRO_CONFIG.attachedAssembly).toBe(true)
        expect(exportedLinks).toBe(CRYPTOPRO_LINKS)
    })

    it.each([undefined, ''])('uses the address defaults when environment values are %s', async value => {
        vi.resetModules()
        vi.stubEnv('REACT_APP_CRYPTOPRO_TSA_URL', value)
        vi.stubEnv('REACT_APP_CRYPTOPRO_INSTRUCTION_LINK', value)
        const { CRYPTOPRO_CONFIG } = await import('./config')
        const { CRYPTOPRO_LINKS } = await import('./links')
        expect(CRYPTOPRO_CONFIG.tsaUrl).toBeUndefined()
        expect(CRYPTOPRO_LINKS.instructionUrl).toBe('https://doc.cxbox.org/features/sign/sign/')
    })

    it('resolves the supplied signature mode independently of the environment', async () => {
        vi.stubEnv('REACT_APP_CRYPTOPRO_SIGNATURE_VERIFICATION_MODE', 'soft')
        const { getSignatureVerificationMode } = await import('./getSignatureVerificationMode')
        expect(getSignatureVerificationMode(undefined)).toBe('strict')
        expect(getSignatureVerificationMode('strict')).toBe('strict')
    })

    it.each([
        [undefined, 'strict'],
        ['', 'strict'],
        ['strict', 'strict'],
        ['soft', 'soft']
    ])('%s selects %s', async (value, expected) => {
        vi.resetModules()
        vi.stubEnv('REACT_APP_CRYPTOPRO_SIGNATURE_VERIFICATION_MODE', value)
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { CRYPTOPRO_CONFIG } = await import('./config')
        expect(CRYPTOPRO_CONFIG.signatureVerificationMode).toBe(expected)
        expect(error).not.toHaveBeenCalled()
    })

    it.each(['SOFT', 'false', '2', ' soft '])('rejects %s with a console message and uses strict', async value => {
        vi.resetModules()
        vi.stubEnv('REACT_APP_CRYPTOPRO_SIGNATURE_VERIFICATION_MODE', value)
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        const { CRYPTOPRO_CONFIG } = await import('./config')
        expect(CRYPTOPRO_CONFIG.signatureVerificationMode).toBe('strict')
        expect(error).toHaveBeenCalledExactlyOnceWith(
            `REACT_APP_CRYPTOPRO_SIGNATURE_VERIFICATION_MODE=${value} is invalid: expected strict or soft. Using strict`
        )
    })
})
