import React, { MutableRefObject } from 'react'
import { Button, Dropdown } from 'antd'
import styles from './RowOperationsButton.less'
import RowOperationsMenu from './RowOperationsMenu'
import { useOperations, useRowMenuInstance, WidgetTableMeta, DataItem } from '@tesler-ui/core'

/**
 * {@link RowOperationsMenu | RowOperationsMenu} properties
 */
interface RowOperationsButtonProps {
    /**
     * Widget meta description
     */
    meta: WidgetTableMeta
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
    setRow: (record: DataItem, e: React.MouseEvent<HTMLElement>) => void
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
export const RowOperationsButton: React.ForwardRefRenderFunction<RowOperationsButtonInstance, RowOperationsButtonProps> = (
    { meta, parent, ...props }: RowOperationsButtonProps,
    ref
) => {
    const { operations, sendOperation, loading, selectRecord } = useOperations(meta.name, {
        /**
         * Nested hierarchies might pass bcName directly
         */
        hierarchyBcName: props.bcName,
        scope: 'record',
        includeSelf: true
    })

    const containerRef = React.useRef<HTMLDivElement>()
    const containerCurrent = containerRef.current
    const [selectedRow, setSelectedRow] = React.useState('')
    const [showMenu, setShowMenu] = React.useState(false)

    /**
     * Fetches row meta to get
     */
    const handleFetchMeta = React.useCallback(() => {
        selectRecord(selectedRow)
    }, [selectRecord, selectedRow])

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
    const handleMenuClosed = React.useCallback(
        (operationKey: string) => {
            handleVisibleChange(false)
            sendOperation(operationKey)
        },
        [handleVisibleChange, sendOperation]
    )

    /**
     * Anchor button popup to container element
     */
    const handlePopupContainer = React.useCallback(() => {
        return containerCurrent
    }, [containerCurrent])

    /**
     * Exposes `setRow` for component instance
     */
    useRowMenuInstance(ref, parent, containerRef, showMenu, setSelectedRow, handleMouseLeave)

    return (
        <div ref={containerRef} className={styles.floatMenu}>
            <Dropdown
                placement="bottomRight"
                trigger={['click']}
                overlay={<RowOperationsMenu operations={operations} loading={loading} onSelect={handleMenuClosed} />}
                onVisibleChange={handleVisibleChange}
                getPopupContainer={handlePopupContainer}
            >
                <Button icon="ellipsis" className={styles.dots} onClick={handleFetchMeta} />
            </Dropdown>
        </div>
    )
}

export default React.forwardRef(RowOperationsButton)
