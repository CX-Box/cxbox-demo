import { afterEach, describe, expect, it, vi } from 'vitest'
import { envBoolean, envString } from './env'

const NAME = 'REACT_APP_ENV_TEST'

afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
})

describe('envString', () => {
    it('returns the value, undefined if not set or empty', () => {
        expect(envString(NAME)).toBeUndefined()
        vi.stubEnv(NAME, '')
        expect(envString(NAME)).toBeUndefined()
        vi.stubEnv(NAME, 'http://tsa.test')
        expect(envString(NAME)).toBe('http://tsa.test')
    })
})

describe('envBoolean', () => {
    it.each([
        [undefined, false, false],
        [undefined, true, true],
        ['true', false, true],
        ['false', true, false]
    ])('%s with default %s → %s', (value, defaultValue, expected) => {
        if (value !== undefined) {
            vi.stubEnv(NAME, value)
        }
        expect(envBoolean(NAME, defaultValue)).toBe(expected)
    })

    it.each(['True', 'yes', '1'])('reports %s and returns the default', value => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.stubEnv(NAME, value)
        expect(envBoolean(NAME)).toBe(false)
        expect(error).toHaveBeenCalledTimes(1)
    })
})
