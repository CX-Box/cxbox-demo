import get from 'lodash.get'
import capitalize from 'lodash.capitalize'
import * as Icons from '@ant-design/icons'
import { QuestionOutlined } from '@ant-design/icons'
import React from 'react'

interface IconProps {
    type?: string
}

export const Icon: React.FC<IconProps> = ({ type = '' }) => {
    const IconComponent = get(Icons, capitalize(type) + 'Outlined', QuestionOutlined)
    return <IconComponent />
}
