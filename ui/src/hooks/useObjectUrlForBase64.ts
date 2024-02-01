import { useEffect, useRef, useState } from 'react'
import { base64toBlob } from '@utils/documentPreview'

export function useObjectUrlForBase64(base64: null | string = null, contentType?: string) {
    const [file, setFile] = useState<Blob | null>(null)
    const [objectUrl, setObjectUrl] = useState<string>()
    const previousBase64 = useRef<string | null>(null)

    useEffect(() => {
        if (typeof base64 === 'string' && previousBase64.current !== base64 && !objectUrl) {
            const blob = base64toBlob(base64, contentType)
            setFile(blob)
            setObjectUrl(URL.createObjectURL(blob))
            previousBase64.current = base64
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
                setObjectUrl(undefined)
            }
        }
    }, [base64, contentType])

    return {
        file,
        objectUrl
    }
}
