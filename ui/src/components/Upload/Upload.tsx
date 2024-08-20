import React from 'react'
import { Upload as AntdUpload } from 'antd'
import { customRequest } from '@components/Upload/customRequest'
import { UploadProps as AntdUploadProps } from 'antd/es/upload/interface'

export interface UploadProps extends AntdUploadProps {}

export const Upload: React.FC<UploadProps> = props => {
    return <AntdUpload customRequest={customRequest} {...props} />
}
