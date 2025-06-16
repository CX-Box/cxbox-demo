import { Input } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { FC } from 'react'

interface Props {
    type: string
}

export const FieldWIP: FC<Props> = props => {
    return <Input placeholder={`${props.type} type is in progress...`} disabled status={'warning'} prefix={<LoadingOutlined />} />
}
