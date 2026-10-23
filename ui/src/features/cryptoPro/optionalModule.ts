import { CadesErrorCode, CadesPluginError, wrapPluginError } from './errors'

/** Lazy loader of an optional module, `() => import('./implementation')` */
export type OptionalModuleLoader<T> = () => Promise<T>

/**
 * Loads an optional part of the feature that can be removed from the application.
 *
 * @remarks
 * The module's `index.ts` exports a loader `() => import('./implementation')`, so its code and dependencies are a separate chunk.
 * To remove the module, delete everything in its directory except `index.ts` and export `undefined` there instead of the loader:
 * the code that uses the module and the bundler configuration stay the same.
 *
 * @param loader - the loader from the module's `index.ts`; `undefined` — the module is removed
 * @param name - module name for the error message
 * @param codes - `missing` — the module is removed; `failed` — its chunk could not be loaded (e.g. a new version was deployed)
 * @throws {@link CadesPluginError} with `codes.missing` or `codes.failed`
 */
export async function loadOptionalModule<T>(
    loader: OptionalModuleLoader<T> | undefined,
    name: string,
    codes: { missing: CadesErrorCode; failed: CadesErrorCode }
): Promise<T> {
    if (!loader) {
        throw new CadesPluginError(codes.missing, `The ${name} module is not included in the application`)
    }
    try {
        return await loader()
    } catch (error) {
        throw wrapPluginError(error, codes.failed)
    }
}
