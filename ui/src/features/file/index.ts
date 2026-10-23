/**
 * Working with files in the browser in chunks: base64 of chunks, base64 text Blob, size check.
 * Does not depend on CryptoPro.
 *
 * @remarks
 * Memory: base64 of a whole file as one string costs ≈ 3.5 × the file size in the browser and hits the V8 string limit
 * at ≈ 400 MB of file (measured in Chromium). Slices of a Blob cost nothing, so large files are read and encoded in chunks;
 * a whole-file string is only for files checked with {@link validateSize} first.
 *
 * @module features/file
 */
export { DEFAULT_CHUNK_SIZE, forEachBase64Chunk } from './base64Chunks'
export type { Base64ChunkHandler } from './base64Chunks'
export { blobToBase64 } from './blobToBase64'
export { dataUrlToBase64 } from './dataUrl'
export { base64ToBytes, blobToBase64TextBlob, Base64TextBuilder } from './base64'
export { FileTooLargeError, validateSize } from './validate'
export { MiB } from './size'
