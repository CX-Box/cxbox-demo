import React from 'react'
import { Upload as AntdUpload } from 'antd'
import { customRequest } from '@components/Upload/customRequest'
import { DraggerProps as AntdDraggerProps } from 'antd/es/upload'

interface DraggerProps extends AntdDraggerProps {}

export const Dragger: React.FC<DraggerProps> = props => {
    return <AntdUpload.Dragger customRequest={customRequest} {...props} />
}
