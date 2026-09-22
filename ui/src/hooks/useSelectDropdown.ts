import { RefObject, useCallback, useMemo, useState } from 'react'
import useFixSelectDropdownForScroll from '@hooks/useFixSelectDropdownForScroll'

const VIEW_SELECTOR = '.ant-layout-content'

/**
 * Whatever the field settings are, a dropdown never takes more than this share of the view,
 * so it cannot cover the menu
 */
const MAX_VIEW_RATIO = 0.7

/**
 * rc-select of antd 3 never moves a dropdown sideways (`adjustX: 0`), so a dropdown wider than its field
 * goes off the screen for a field at the right edge. With `adjustX` it is aligned to the right edge of the field instead.
 */
const DROPDOWN_ALIGN = { overflow: { adjustX: 1, adjustY: 1 } }

/**
 * Props for a select whose dropdown is allowed to be wider than its field (`dropdownMatchSelectWidth: false`).
 *
 * The dropdown grows with the longest value, but takes at most `maxCols` field widths and at most a share of the view.
 * It is never narrower than the field: antd puts the field width into the dropdown `min-width`.
 * CSS alone is not enough: the dropdown is rendered in `body` and does not know the field width.
 *
 * Values longer than the resulting width are cut by the antd style of a dropdown item, the full value stays
 * available in the `title` of an option.
 *
 * @param selectRef Ref of the antd select
 * @param maxCols How many field widths the dropdown may take
 */
const useSelectDropdown = (selectRef: RefObject<any>, maxCols: number) => {
    const [maxWidth, setMaxWidth] = useState<number>()
    const fixDropdownForScroll = useFixSelectDropdownForScroll(selectRef)

    const onDropdownVisibleChange = useCallback(
        (open: boolean) => {
            fixDropdownForScroll(open)

            // root element of rc-select, `useFixSelectDropdownForScroll` works with the same instance
            const field: HTMLElement | undefined = selectRef.current?.rcSelect?.rootRef

            if (open && field) {
                const viewWidth = (field.closest(VIEW_SELECTOR) ?? document.documentElement).clientWidth
                setMaxWidth(Math.min(field.offsetWidth * maxCols, viewWidth * MAX_VIEW_RATIO))
            }
        },
        [selectRef, maxCols, fixDropdownForScroll]
    )

    const dropdownStyle = useMemo(() => (maxWidth ? { maxWidth } : undefined), [maxWidth])

    return { dropdownStyle, dropdownAlign: DROPDOWN_ALIGN, onDropdownVisibleChange }
}

export default useSelectDropdown
