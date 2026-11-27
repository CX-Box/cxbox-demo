export const AUTH_ERROR_STATUS_CODES = [401, 403] as const

export type AuthErrorStatusCode = (typeof AUTH_ERROR_STATUS_CODES)[number]

export function isAuthErrorStatus(status: number | undefined): status is AuthErrorStatusCode {
    return AUTH_ERROR_STATUS_CODES.some(code => code === status)
}
