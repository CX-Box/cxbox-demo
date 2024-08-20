import { useRef } from 'react'
import { UploadProps } from 'antd/es/upload/interface'
import { CxBoxApiInstance } from '../api'
import { getCustomUploadRequest } from '@components/Upload/getCustomUploadRequest'

/**
 * returns a custom request for antd upload, canceling the previous one
 */
export const useSingleUploadRequest = () => {
    const previousAbortController = useRef<AbortController | undefined>()

    const request: UploadProps['customRequest'] = options => {
        previousAbortController.current?.abort()
        const currentAbortController = new AbortController()
        previousAbortController.current = currentAbortController

        return getCustomUploadRequest(CxBoxApiInstance.api$.instance, currentAbortController)(options)
    }

    return request
}
