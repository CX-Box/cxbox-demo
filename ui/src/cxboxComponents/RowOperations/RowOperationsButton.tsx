import React, { ForwardedRef, MutableRefObject } from 'react'
import { Button, Dropdown } from 'antd'
import styles from './RowOperationsButton.less'
import RowOperationsMenu from './RowOperationsMenu'
import { useAppDispatch } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'
import { useRowMenuInstance } from '@hooks/useRowMenu'

/**
 * {@link RowOperationsMenu | RowOperationsMenu} properties
 */
interface RowOperationsButtonProps {
    /**
     * Widget meta description
     */
    meta: interfaces.WidgetTableMeta
    /**
     * Use when business component differs from widget's (e.g. hierarchies nested level)
     */
    bcName?: string
    /**
     * Common parent for {@link Table | Table} and {@link RowOperationsButton | RowOperationsButton}
     */
    parent: MutableRefObject<HTMLElement>
}

/**
 * {@link RowOperationsButton | RowOperationsButton} instance
 */
export interface RowOperationsButtonInstance {
    setRow: (record: interfaces.DataItem, e: React.MouseEvent<HTMLElement>) => void
    containerRef: MutableRefObject<HTMLElement>
}

/**
 * Button that shows available operations for the row
 *
 * On click fetches row meta for clicked row by dispatching
 * {@link ActionPayloadTypes.bcSelectRecord | bcSelectRecord} and shows {@link RowOperationsMenu | RowOperationsMenu}
 *
 * {@link RowOperationsButtonInstance.setRow | setRow} can be used to dynamically place the button
 * next to hovered row.
 *
 * @param props - Component properties
 * @param ref - Assigned reference will receive component instance
 */
export const RowOperationsButton = (
    { meta, parent, ...props }: RowOperationsButtonProps,
    ref: ForwardedRef<RowOperationsButtonInstance>
) => {
    const dispatch = useAppDispatch()
    /**
     * Nested hierarchies might pass bcName directly
     */
    const bcName = props.bcName || meta.bcName
    const containerRef = React.useRef<HTMLDivElement>()
    const containerCurrent = containerRef.current
    const [selectedRow, setSelectedRow] = React.useState('')
    const [showMenu, setShowMenu] = React.useState(false)

    /**
     * Fetches row meta to get
     */
    const handleFetchMeta = React.useCallback(() => {
        dispatch(actions.bcSelectRecord({ bcName, cursor: selectedRow }))
    }, [bcName, selectedRow, dispatch])

    /**
     * Hides the button
     *
     * @param force - Hides the button even if menu is open
     */
    const handleMouseLeave = React.useCallback(
        (force?: boolean) => {
            if (containerRef.current && (!showMenu || force)) {
                containerRef.current.style.display = 'none'
            }
        },
        [showMenu]
    )

    /**
     * Links menu visibility to the state and hides the button on closing menu (???)
     *
     * @param visibility
     */
    const handleVisibleChange = React.useCallback(
        (visibility: boolean) => {
            setShowMenu(visibility)
            if (!visibility) {
                handleMouseLeave(true)
            }
        },
        [handleMouseLeave]
    )

    /**
     * Close menu after operation was selected
     */
    const handleMenuClosed = React.useCallback(() => {
        handleVisibleChange(false)
    }, [handleVisibleChange])

    /**
     * Anchor button popup to container element
     */
    const handlePopupContainer = React.useCallback(() => {
        return containerCurrent as HTMLElement
    }, [containerCurrent])

    /**
     * Exposes `setRow` for component instance
     */
    useRowMenuInstance(ref, parent, containerRef as React.MutableRefObject<HTMLDivElement>, showMenu, setSelectedRow, handleMouseLeave)

    return (
        <div ref={containerRef as React.MutableRefObject<HTMLDivElement>} className={styles.floatMenu}>
            <Dropdown
                placement="bottomRight"
                trigger={['click']}
                overlay={<RowOperationsMenu meta={meta} bcName={bcName} onSelect={handleMenuClosed} />}
                onVisibleChange={handleVisibleChange}
                getPopupContainer={handlePopupContainer}
            >
                {/*<Icon type="ellipsis" className={styles.dots} onClick={handleFetchMeta} />*/}
                <Button className={styles.dots} data-test-widget-list-row-action={true} icon="ellipsis" onClick={handleFetchMeta} />
            </Dropdown>
        </div>
    )
}

export default React.forwardRef(RowOperationsButton)
