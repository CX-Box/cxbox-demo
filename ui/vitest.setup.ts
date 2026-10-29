// Node has Blob and atob, but no FileReader: readAsDataURL with the same prefix as in the browser
if (typeof globalThis.FileReader === 'undefined') {
    class NodeFileReader {
        result: string | null = null
        error: unknown = null
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        readAsDataURL(blob: Blob) {
            blob.arrayBuffer().then(
                buffer => {
                    this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buffer).toString('base64')}`
                    this.onload?.()
                },
                error => {
                    this.error = error
                    this.onerror?.()
                }
            )
        }
    }
    globalThis.FileReader = NodeFileReader as unknown as typeof FileReader
}
