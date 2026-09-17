import React, { useCallback } from 'react'
import { UniquePopover, UniquePopoverProps } from '@components/widgets/CalendarList/components/popovers/UniquePopover'

export interface UniquePopoverHoverAndClickProps
    extends Omit<UniquePopoverProps, 'trigger' | 'content' | 'uid' | 'overlayClassName' | 'onVisibleChange'> {
    contentHover?: React.ReactNode
    contentClick?: React.ReactNode
    overlayClassNameHover: UniquePopoverProps['overlayClassName']
    overlayClassNameClick: UniquePopoverProps['overlayClassName']
    overlayStyleClick?: UniquePopoverProps['overlayStyle']
    onVisibleChange?: (visible: boolean, uid: string, triggerType: 'hover' | 'click') => void
}

const UniquePopoverHoverAndClick: React.FC<UniquePopoverHoverAndClickProps> = props => {
    const {
        children,
        contentHover,
        contentClick,
        overlayClassNameClick,
        overlayClassNameHover,
        overlayStyleClick,
        onVisibleChange,
        ...rest
    } = props

    const handleVisibleChangeHover = useCallback(
        (nextVisible: boolean, uid: string) => {
            onVisibleChange?.(nextVisible, uid, 'hover')
        },
        [onVisibleChange]
    )

    const handleVisibleChangeClick = useCallback(
        (nextVisible: boolean, uid: string) => {
            onVisibleChange?.(nextVisible, uid, 'click')
        },
        [onVisibleChange]
    )
    return (
        <UniquePopover
            onVisibleChange={handleVisibleChangeHover}
            overlayClassName={overlayClassNameHover}
            trigger="hover"
            content={contentHover}
            {...rest}
        >
            <UniquePopover
                onVisibleChange={handleVisibleChangeClick}
                overlayClassName={overlayClassNameClick}
                overlayStyle={overlayStyleClick}
                trigger="click"
                content={contentClick}
                {...rest}
            >
                {children}
            </UniquePopover>
        </UniquePopover>
    )
}

export default React.memo(UniquePopoverHoverAndClick)
