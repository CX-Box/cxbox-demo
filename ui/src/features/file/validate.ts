/**
 * The Blob is larger than allowed for an operation that reads it whole.
 */
export class FileTooLargeError extends Error {
    readonly code = 'FILE_TOO_LARGE'

    /**
     * @param size - actual size, bytes
     * @param maxSize - allowed size, bytes
     */
    constructor(readonly size: number, readonly maxSize: number) {
        super(`File is too large: ${size} bytes, allowed ${maxSize} bytes`)
        this.name = 'FileTooLargeError'
    }
}

/**
 * Checks the size before the Blob is read, so that a too large file fails fast and without memory spikes.
 *
 * @param maxSize - allowed size, bytes (inclusive)
 * @throws {@link FileTooLargeError} if `blob.size > maxSize`
 */
export function validateSize(blob: Blob, maxSize: number): void {
    if (blob.size > maxSize) {
        throw new FileTooLargeError(blob.size, maxSize)
    }
}
