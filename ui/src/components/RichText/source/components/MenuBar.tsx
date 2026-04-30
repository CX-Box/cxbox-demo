import '../../wysiwyg/components/MenuBar.module.less'
import React from 'react'
import { ViewMode } from '../../common/types'
import CommonMenuBar from '@components/RichText/common/components/MenuBar'

interface Props {
    onViewModeChange: (mode: ViewMode) => void
}

export default function MenuBar({ onViewModeChange }: Props) {
    return (
        <CommonMenuBar
            rightButton={{
                icon: 'file-list-2-line',
                title: 'View Rich Text',
                action: () => onViewModeChange('wysiwyg')
            }}
        />
    )
}
