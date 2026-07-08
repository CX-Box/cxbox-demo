import '../../wysiwyg/components/MenuBar.module.less'
import React from 'react'
import { ViewMode } from '../../common/types'
import CommonMenuBar from '@components/RichText/common/components/MenuBar'
import { FontCursor, Gear } from '@gravity-ui/icons'
import { useTranslation } from 'react-i18next'
import { useToolbarStableWidthProps } from '@components/RichText/source/hooks/useToolbarStableWidthProps'

interface Props {
    className?: string
    toolbarDisabled?: boolean
    onViewModeChange: (mode: ViewMode) => void
}

export default function MenuBar({ onViewModeChange, toolbarDisabled, className }: Props) {
    const { t } = useTranslation()
    const stableWidthProps = useToolbarStableWidthProps()

    return (
        <CommonMenuBar
            className={className}
            {...stableWidthProps}
            toolbarDisabled={toolbarDisabled}
            rightButton={{
                key: 'Settings',
                icon: <Gear width={16} height={16} />,
                title: t('Settings'),
                items: [
                    {
                        key: 'Visual Editor',
                        icon: <FontCursor width={16} height={16} />,
                        title: t('Visual Editor'),
                        action: () => onViewModeChange('wysiwyg')
                    }
                ]
            }}
        />
    )
}
