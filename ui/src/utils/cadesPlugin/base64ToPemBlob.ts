export function base64ToPemBlob(base64: string, mimeType: string = 'application/octet-stream'): Blob {
    return new Blob([base64], {
        type: mimeType
    })
}
