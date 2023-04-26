import React from 'react'
import { WidgetTableMeta } from '@cxbox-ui/core/interfaces/widget'
import { Dropdown, Button } from 'antd'
import { useDispatch } from 'react-redux'
import { $do } from '../../../../actions/types'
import { RowOperationsMenu } from '@cxbox-ui/core'
import styles from './MenuColumn.module.css'

interface MenuColumnProps {
    meta: WidgetTableMeta
    rowKey: string
}

function MenuColumn({ meta, rowKey }: MenuColumnProps) {
    const { bcName } = meta
    const dispatch = useDispatch()
    const [showMenu, setShowMenu] = React.useState(false)

    const handleFetchMeta = React.useCallback(() => {
        dispatch($do.bcSelectRecord({ bcName, cursor: rowKey }))
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
