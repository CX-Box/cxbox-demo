import { UploadProps } from 'antd/es/upload/interface'
import { AxiosInstance } from 'axios'

export const getCustomUploadRequest =
    (axios: AxiosInstance, abortController: AbortController): Required<UploadProps>['customRequest'] =>
    ({ action, data, file, filename, headers, onError, onProgress, onSuccess, withCredentials }) => {
        const formData = new FormData()

        if (data) {
            Object.keys(data).forEach(key => {
                formData.append(key, (data as Record<string, string>)[key])
            })
        }

        formData.append(filename, file)

        axios
            .post(action, formData, {
                withCredentials,
                headers,
                onUploadProgress: ({ total, loaded }) => {
                    const percent = +Math.round((loaded / (total as number)) * 100).toFixed(2)

                    onProgress({ percent }, file)
                },
                signal: abortController.signal,
                baseURL: ''
            })
            .then(({ data: response }) => {
                onSuccess(response, file)
            })
            .catch(onError)

        return {
            abort() {
                abortController.abort()
            }
        }
    }
