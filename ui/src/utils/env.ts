/**
 * Application settings from environment variables `REACT_APP_*` (`ui/.env*`, read at build time).
 *
 * @remarks
 * The only place that reads `process.env`: when the bundler changes (e.g. `import.meta.env` in Vite), only this file changes.
 */

/** String value; `undefined` if the variable is not set or empty. */
export function envString(name: string): string | undefined {
    const value = process.env[name]
    return value === undefined || value === '' ? undefined : value
}

/** `true` or `false`; not set — `defaultValue`, another value is reported to the console and replaced with `defaultValue`. */
export function envBoolean(name: string, defaultValue = false): boolean {
    const value = envString(name)
    if (value === undefined) {
        return defaultValue
    }
    if (value === 'true' || value === 'false') {
        return value === 'true'
    }
    console.error(`${name}=${value} is invalid: expected true or false. Using ${defaultValue}`)
    return defaultValue
}
