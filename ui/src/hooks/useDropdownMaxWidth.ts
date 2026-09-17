import { RefObject, useCallback, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import useFixSelectDropdownForScroll from '@hooks/useFixSelectDropdownForScroll'

const VIEW_SELECTOR = '.ant-layout-content'

/**
 * Unconditional upper limit: whatever the settings are, the dropdown takes at most this share of the view
 */
const MAX_VIEW_RATIO = 0.7

/**
 * Upper limit for a select dropdown that is allowed to be wider than its field.
 *
 * The lower bound is set by antd itself (`min-width` = measured field width), so the dropdown is never
 * narrower than the field; this hook only limits how far it grows: `maxCols` field widths, and never
 * wider than the view, so it cannot cover the menu.
 *
 * @param selectRef Ref of the select, the same one used for dropdown alignment
 * @param maxCols How many field widths the dropdown may occupy
 */
const useDropdownMaxWidth = (selectRef: RefObject<any>, maxCols: number) => {
    const [maxWidth, setMaxWidth] = useState<number>()
    const fixDropdownForScroll = useFixSelectDropdownForScroll(selectRef)

    const onDropdownVisibleChange = useCallback(
        (open: boolean) => {
            if (open) {
                const field = ReactDOM.findDOMNode(selectRef.current) as HTMLElement | null
                const fieldWidth = field?.offsetWidth

                if (fieldWidth) {
                    const viewWidth = (field?.closest(VIEW_SELECTOR) as HTMLElement)?.clientWidth

                    setMaxWidth(Math.min(fieldWidth * maxCols, viewWidth ? viewWidth * MAX_VIEW_RATIO : Infinity))
                }
            }

            fixDropdownForScroll(open)
        },
        [selectRef, maxCols, fixDropdownForScroll]
    )

    const dropdownStyle = useMemo(() => (maxWidth ? { maxWidth } : undefined), [maxWidth])

    return { dropdownStyle, onDropdownVisibleChange }
}

export default useDropdownMaxWidth
