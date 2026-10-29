/**
 * Attached signature of a file of any size assembled from a detached one (`REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY=true`);
 * with the flag on it is used for every attached signature.
 *
 * @remarks
 * Optional: loaded lazily via {@link loadOptionalModule}, its code and pkijs are separate chunks.
 * To remove it, delete everything in this directory except this file, replace the loader below with `undefined`
 * and remove the `pkijs` and `asn1js` dependencies. Nothing outside the directory changes;
 * with the flag on, an attached signature then fails with `ASSEMBLY_NOT_AVAILABLE`.
 *
 * @module features/cryptoPro/attachedAssembly
 */
import { OptionalModuleLoader } from '../optionalModule'
import { AttachedAssembly } from '../types'

export const loadAttachedAssembly: OptionalModuleLoader<AttachedAssembly> | undefined = () => import('./assembled')
