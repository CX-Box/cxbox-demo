/**
 * Checks that the value is not 'null' or 'undefined'.
 *
 * @param value
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined
}
