import { isDefined } from '@utils/isDefined'

const hasNativeHasOwn = typeof Object.hasOwn === 'function'

export const hasOwn = <T extends object, K extends PropertyKey>(
    obj: T | null | undefined,
    key: K
): obj is T & (K extends keyof T ? { [P in K]-?: T[P] } : { [P in K]: unknown }) => {
    if (isDefined(obj)) {
        return hasNativeHasOwn ? Object.hasOwn(obj, key) : Object.prototype.hasOwnProperty.call(obj, key)
    }

    return false
}
