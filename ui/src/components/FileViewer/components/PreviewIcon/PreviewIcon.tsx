import React from 'react'
import { icons } from '../FileIcon/icons'
import { isAudioExtension } from '@utils/fileViewer'
import { Icon as AntIcon } from 'antd'
import { isDefined } from '@utils/isDefined'

export interface PreviewIconProps {
    className?: string
    type: keyof typeof icons.small | keyof typeof icons.full | string | undefined
}

function PreviewIcon({ className, type }: PreviewIconProps) {
    if (isDefined(type) && isAudioExtension(type)) {
        return <AntIcon className={className} type={'customer-service'} />
    }

    const EyeIcon = icons.others.eye
    return <EyeIcon className={className} />
}

export default PreviewIcon
