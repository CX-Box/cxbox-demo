import { expect, test } from 'vitest'
import { isAuthErrorStatus } from './authErrorStatus'

test.each([
    { status: 401, expected: true },
    { status: 403, expected: true },
    { status: 404, expected: false },
    { status: 502, expected: false },
    { status: undefined, expected: false }
])('isAuthErrorStatus($status) returns $expected', ({ status, expected }) => {
    expect(isAuthErrorStatus(status)).toBe(expected)
})
