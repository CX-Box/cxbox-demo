import React, { useCallback, useMemo, useRef } from 'react'
import { Popover } from 'antd'
import { PopoverProps } from 'antd/es/popover'
import { nanoid } from '@reduxjs/toolkit'
import { isDefined } from '@utils/isDefined'

type VisibleGetter = (uid: string) => boolean

export type UniquePopoverProps = Omit<PopoverProps, 'visible' | 'onVisibleChange'> & {
    visible?: VisibleGetter
    onVisibleChange?: (visible: boolean, uid: string) => void
}

export const UniquePopover: React.FC<UniquePopoverProps> = props => {
    const { visible, onVisibleChange, children, ...rest } = props
    const popoverRestProps: PopoverProps = { ...rest }

    const uidRef = useRef<string>(nanoid())
    const uid = uidRef.current

    const computedVisible = useMemo(() => visible?.(uid), [visible, uid])

    popoverRestProps.onVisibleChange = useCallback(
        (nextVisible: boolean) => {
            onVisibleChange?.(nextVisible, uid)
        },
        [onVisibleChange, uid]
    )

    if (computedVisible !== undefined) {
        popoverRestProps.visible = computedVisible
    }

    const withoutContent = !isDefined(rest.content)

    if (withoutContent) {
        delete popoverRestProps.onVisibleChange
    }

    return <Popover {...popoverRestProps}>{children}</Popover>
}
