import React, { useCallback } from 'react'
import { TimePicker as AntdTimePicker } from 'antd'
import { TimePickerProps as AntdTimePickerProps } from 'antd/lib/time-picker'
import styles from './TimePicker.less'

export interface TimePickerProps extends AntdTimePickerProps {
    /**
     * Enter in the panel with a valid or empty time. The panel is already asked to close.
     */
    onPressEnter?: () => void
}

const PANEL_CLASS = 'ant-time-picker-panel'
const INVALID_INPUT_CLASS = 'ant-time-picker-panel-input-invalid'

/**
 * antd `TimePicker` that closes the panel on Enter, as the date pickers do.
 *
 * antd 3 handles only Esc. Enter anywhere in the panel (the input, a time chosen with the mouse, Ok)
 * asks to close through `onOpenChange(false)`. A wrong time in the input keeps the panel open,
 * so the typed text is not lost.
 */
function TimePicker({ onPressEnter, ...rest }: TimePickerProps) {
    const { onOpenChange } = rest

    // The panel is in a portal: its keys reach this wrapper through React, not through the DOM
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLSpanElement>) => {
            const target = e.target as HTMLElement
            if (e.key !== 'Enter' || !target.closest(`.${PANEL_CLASS}`) || target.classList.contains(INVALID_INPUT_CLASS)) {
                return
            }
            e.preventDefault() // Ok in focus gets no second click
            onOpenChange?.(false)
            onPressEnter?.()
        },
        [onOpenChange, onPressEnter]
    )

    return (
        <span className={styles.root} onKeyDown={handleKeyDown}>
            <AntdTimePicker {...rest} />
        </span>
    )
}

export default React.memo(TimePicker)
