const BASE64_SUFFIX = ';base64'

/**
 * base64 data of a data URL `data:[<mediatype>][;base64],<data>` (RFC 2397).
 *
 * @remarks
 * Everything before the data comma is the data URL header, not the data. The comma is searched from the end:
 * base64 has no commas, while the media type is the Blob type as is (e.g. the server Content-Type) and may contain commas
 * and even `;base64,` (checked in Chromium 150: `FileReader` copies the type into the header unchanged).
 *
 * @throws Error for a data URL without `;base64` data — instead of returning a part of the header as data
 */
export function dataUrlToBase64(dataUrl: string): string {
    const comma = dataUrl.lastIndexOf(',')
    if (!dataUrl.startsWith('data:') || comma === -1 || !dataUrl.slice(0, comma).toLowerCase().endsWith(BASE64_SUFFIX)) {
        throw new Error('FileReader returned a data URL without base64 data')
    }
    return dataUrl.slice(comma + 1)
}
