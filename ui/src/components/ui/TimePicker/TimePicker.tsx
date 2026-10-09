import React, { useCallback } from 'react'
import { TimePicker as AntdTimePicker } from 'antd'
import { TimePickerProps as AntdTimePickerProps } from 'antd/lib/time-picker'

export interface TimePickerProps extends AntdTimePickerProps {
    /**
     * Enter in the panel input with a valid or empty time. The panel is already asked to close.
     */
    onPressEnter?: () => void
}

const INVALID_INPUT_CLASS = 'ant-time-picker-panel-input-invalid'

/**
 * antd `TimePicker` that closes the panel on Enter, as the date pickers do.
 *
 * antd 3 handles only Esc. Enter here asks to close through `onOpenChange(false)`.
 * A wrong time keeps the panel open, so the typed text is not lost.
 */
function TimePicker({ onPressEnter, ...rest }: TimePickerProps) {
    const { onOpenChange } = rest

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== 'Enter' || e.currentTarget.classList.contains(INVALID_INPUT_CLASS)) {
                return
            }
            onOpenChange?.(false)
            onPressEnter?.()
        },
        [onOpenChange, onPressEnter]
    )

    // rc-time-picker calls onKeyDown for the panel input, antd 3 typings miss the prop
    const panelInputProps = { onKeyDown: handleKeyDown } as AntdTimePickerProps

    return <AntdTimePicker {...rest} {...panelInputProps} />
}

export default React.memo(TimePicker)
