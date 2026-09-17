import { RefObject, useCallback, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import useFixSelectDropdownForScroll from '@hooks/useFixSelectDropdownForScroll'

const VIEW_SELECTOR = '.ant-layout-content'

/**
 * Whatever the field settings are, a dropdown never takes more than this share of the view,
 * so it cannot cover the menu
 */
const MAX_VIEW_RATIO = 0.7

/**
 * Props for a select whose dropdown is allowed to be wider than its field (`dropdownMatchSelectWidth: false`).
 *
 * The lower bound is set by antd itself: it measures the field and puts its width into the dropdown `min-width`,
 * so the dropdown is never narrower than the field. This hook adds the upper bound — `maxCols` field widths —
 * and keeps the dropdown aligned while the page is scrolled.
 *
 * Values longer than the resulting width are cut by the antd style of a dropdown item, the full value stays
 * available in the `title` of an option.
 *
 * @param selectRef Ref of the select, also used for dropdown alignment
 * @param maxCols How many field widths the dropdown may take
 */
const useSelectDropdown = (selectRef: RefObject<any>, maxCols: number) => {
    const [maxWidth, setMaxWidth] = useState<number>()
    const fixDropdownForScroll = useFixSelectDropdownForScroll(selectRef)

    const onDropdownVisibleChange = useCallback(
        (open: boolean) => {
            if (open) {
                const field = ReactDOM.findDOMNode(selectRef.current) as HTMLElement | null
                const fieldWidth = field?.offsetWidth

                if (fieldWidth) {
                    const viewWidth = (field?.closest(VIEW_SELECTOR) as HTMLElement)?.clientWidth || document.documentElement.clientWidth

                    setMaxWidth(Math.min(fieldWidth * maxCols, viewWidth * MAX_VIEW_RATIO))
                }
            }

            fixDropdownForScroll(open)
        },
        [selectRef, maxCols, fixDropdownForScroll]
    )

    const dropdownStyle = useMemo(() => (maxWidth ? { maxWidth } : undefined), [maxWidth])

    return { dropdownStyle, onDropdownVisibleChange }
}

export default useSelectDropdown
