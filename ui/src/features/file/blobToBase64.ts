import { dataUrlToBase64 } from './dataUrl'

/**
 * base64 of the whole Blob as one string, as in plugin-samples-fileapi.
 *
 * @remarks
 * Holds the whole Blob as a string (see the module memory note): for chunks and small data.
 * Large files — {@link forEachBase64Chunk}; check the size with {@link validateSize} first.
 *
 * @throws Error if the browser returns a data URL without base64 data
 */
export async function blobToBase64(blob: Blob): Promise<string> {
    if (blob.size === 0) {
        // nothing to read; Chromium 150 gives "data:<type>;base64," here, the shortcut does not depend on the browser
        return ''
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
    })
    return dataUrlToBase64(dataUrl)
}
