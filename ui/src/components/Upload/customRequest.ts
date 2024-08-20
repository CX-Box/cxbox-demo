import { UploadProps } from 'antd/es/upload/interface'
import { CxBoxApiInstance } from '../../api'
import { getCustomUploadRequest } from '@components/Upload/getCustomUploadRequest'

export const customRequest: UploadProps['customRequest'] = options => {
    const currentAbortController = new AbortController()

    return getCustomUploadRequest(CxBoxApiInstance.api$.instance, currentAbortController)(options)
}
