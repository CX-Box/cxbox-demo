import { FC } from 'react'
import { Card } from 'antd'
import error from '../assets/images/error.gif'

interface Props {
    type: string
}

export const WidgetError: FC<Props> = ({ type }) => {
    return (
        <Card cover={<img src={error} alt={''} />} style={{ width: 300 }}>
            <Card.Meta title={type} description={'Wrong widget type!'} />
        </Card>
    )
}
