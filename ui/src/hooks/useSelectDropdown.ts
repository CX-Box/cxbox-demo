import { RefObject, useCallback, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import useFixSelectDropdownForScroll from '@hooks/useFixSelectDropdownForScroll'
import styles from './useSelectDropdown.module.css'

const VIEW_SELECTOR = '.ant-layout-content'

/**
 * Whatever the field settings are, a dropdown never takes more than this share of the view,
 * so it cannot cover the menu
 */
const MAX_VIEW_RATIO = 0.7

interface DropdownBounds {
    /**
     * Lower bound, it repeats the antd one until the field itself gets wider than the view
     */
    minWidth: number
    maxWidth: number
    fieldWidth: number
}

/**
 * Props for a select whose dropdown is allowed to be wider than its field (`dropdownMatchSelectWidth: false`).
 *
 * The dropdown grows with the longest value but takes at most `maxCols` field widths, and never more than
 * a share of the view, so it cannot cover the menu. Both bounds are set by us: antd puts the field width into
 * the dropdown `min-width`, and on a narrow window that lower bound alone would win over the upper one.
 *
 * Values longer than the resulting width are cut by the antd style of a dropdown item, the full value stays
 * available in the `title` of an option.
 *
 * @param selectRef Ref of the select, also used for dropdown alignment
 * @param maxCols How many field widths the dropdown may take
 */
const useSelectDropdown = (selectRef: RefObject<any>, maxCols: number) => {
    const [bounds, setBounds] = useState<DropdownBounds>()
    const fixDropdownForScroll = useFixSelectDropdownForScroll(selectRef)

    const onDropdownVisibleChange = useCallback(
        (open: boolean) => {
            fixDropdownForScroll(open)

            if (!open) {
                return
            }

            const field = ReactDOM.findDOMNode(selectRef.current) as HTMLElement | null
            const fieldRect = field?.getBoundingClientRect()

            if (!fieldRect?.width) {
                return
            }

            const view = field?.closest(VIEW_SELECTOR) as HTMLElement | null
            const viewWidth = view?.getBoundingClientRect().width || document.documentElement.clientWidth
            const maxWidth = Math.min(fieldRect.width * maxCols, viewWidth * MAX_VIEW_RATIO)

            setBounds({ minWidth: Math.min(fieldRect.width, maxWidth), maxWidth, fieldWidth: fieldRect.width })
        },
        [selectRef, maxCols, fixDropdownForScroll]
    )

    const dropdownStyle = useMemo(() => {
        if (!bounds) {
            return undefined
        }

        // antd sets the lower bound in the inline style, so ours goes through the variable of `dropdownClassName`
        return {
            ['--select-dropdown-min-width' as string]: `${bounds.minWidth}px`,
            maxWidth: bounds.maxWidth
        }
    }, [bounds])

    // the class lowers the antd bound, so it is added only when the field itself is wider than allowed
    const dropdownClassName = bounds && bounds.minWidth < bounds.fieldWidth ? styles.dropdown : undefined

    return { dropdownStyle, dropdownClassName, onDropdownVisibleChange }
}

export default useSelectDropdown
