import { useRef } from 'react'
import { UploadProps } from 'antd/es/upload/interface'
import axios from 'axios'

/**
 * returns a custom request for antd upload, canceling the previous one
 */
export const useSingleUploadRequest = () => {
    const previousAbortController = useRef<AbortController | undefined>()

    const request: UploadProps['customRequest'] = ({
        action,
        data,
        file,
        filename,
        headers,
        onError,
        onProgress,
        onSuccess,
        withCredentials
    }) => {
        const formData = new FormData()

        if (data) {
            Object.keys(data).forEach(key => {
                formData.append(key, (data as Record<string, string>)[key])
            })
        }

        formData.append(filename, file)

        previousAbortController.current?.abort()
        const currentAbortController = new AbortController()
        previousAbortController.current = currentAbortController

        axios
            .post(action, formData, {
                withCredentials,
                headers,
                onUploadProgress: ({ total, loaded }) => {
                    const percent = +Math.round((loaded / (total as number)) * 100).toFixed(2)

                    onProgress({ percent }, file)
                },
                signal: previousAbortController.current?.signal
            })
            .then(({ data: response }) => {
                onSuccess(response, file)
            })
            .catch(onError)

        return {
            abort() {
                currentAbortController.abort()
            }
        }
    }

    return request
}
