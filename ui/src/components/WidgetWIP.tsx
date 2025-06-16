import { FC } from 'react'
import { Card } from 'antd'
import wip from '../assets/images/wip.gif'

interface Props {
    type: string
}

export const WidgetWIP: FC<Props> = props => {
    return (
        <Card cover={<img src={wip} alt={''} />} style={{ width: 300 }}>
            <Card.Meta title={props.type} description={'Work in progress!'} />
        </Card>
    )
}
