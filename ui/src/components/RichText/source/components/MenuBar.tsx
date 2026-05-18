import '../../wysiwyg/components/MenuBar.module.less'
import React from 'react'
import { ViewMode } from '../../common/types'
import CommonMenuBar from '@components/RichText/common/components/MenuBar'
import { FontCursor, Gear } from '@gravity-ui/icons'

interface Props {
    toolbarDisabled?: boolean
    onViewModeChange: (mode: ViewMode) => void
}

export default function MenuBar({ onViewModeChange, toolbarDisabled }: Props) {
    return (
        <CommonMenuBar
            toolbarDisabled={toolbarDisabled}
            rightButton={{
                icon: <Gear width={16} height={16} />,
                title: 'Settings',
                items: [
                    {
                        icon: <FontCursor width={16} height={16} />,
                        title: 'Visual Editor',
                        action: () => onViewModeChange('wysiwyg')
                    }
                ]
            }}
        />
    )
}
