export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            const result = reader.result as string
            const header = ';base64,'
            const idx = result.indexOf(header)

            if (idx !== -1) {
                resolve(result.substring(idx + header.length))
            } else {
                reject(new Error('Cannot extract base64 data from Blob'))
            }
        }

        reader.onerror = () => reject(reader.error)

        reader.readAsDataURL(blob)
    })
}
