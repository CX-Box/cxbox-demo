import React from 'react'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import { Dropdown, Button } from 'antd'
import styles from './MenuColumn.module.css'
import { bcSelectRecord } from '@cxbox-ui/core/actions'
import { useAppDispatch } from '../../../../store'

interface MenuColumnProps {
    meta: WidgetTableMeta
    rowKey: string
}

function MenuColumn({ meta, rowKey }: MenuColumnProps) {
    const { bcName } = meta
    const dispatch = useAppDispatch()
    const [showMenu, setShowMenu] = React.useState(false)

    const handleFetchMeta = React.useCallback(() => {
        dispatch(bcSelectRecord({ bcName, cursor: rowKey }))
    }, [bcName, rowKey, dispatch])

    const handleVisibleChange = React.useCallback(
        (visibility: boolean) => {
            setShowMenu(visibility)
        },
        [setShowMenu]
    )

    const handleMenuClosed = React.useCallback(() => {
        handleVisibleChange(false)
    }, [handleVisibleChange])

    return (
        <Dropdown
            visible={showMenu}
            placement="bottomRight"
            trigger={['click']}
            onVisibleChange={handleVisibleChange}
            overlay={
                <div className={styles.overlayContainer}>
                    <RowOperationsMenu meta={meta} bcName={bcName} onSelect={handleMenuClosed} />
                </div>
            }
        >
            <Button icon="more" onClick={handleFetchMeta} type="link" className={styles.button} />
        </Dropdown>
    )
}

export default React.memo(MenuColumn)
