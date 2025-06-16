import { FC } from 'react'
import { Input } from 'antd'
import { BugOutlined } from '@ant-design/icons'

interface Props {
    type: string
}

export const FieldError: FC<Props> = ({ type }) => {
    return <Input status={'error'} placeholder={`${type} wrong field type!`} prefix={<BugOutlined />} disabled />
}
