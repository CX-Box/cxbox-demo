import { applyParams, getFileUploadEndpoint } from '@utils/api'
import { useGetFieldValue } from '@hooks/useGetFieldValue'

export const useFileFieldData = (
    bcName: string | undefined,
    recordId: string | null | undefined,
    fieldName: string,
    fileIdKey: string,
    fileSource?: string
) => {
    const getValue = useGetFieldValue(bcName, recordId)

    const fileName = getValue(fieldName) as string | undefined
    const fileId = getValue(fileIdKey)

    const downloadUrl = fileId ? applyParams(getFileUploadEndpoint(), { source: fileSource, id: String(fileId) }) : undefined

    return { fileName, downloadUrl, fileId }
}
