import React, { memo, useCallback } from 'react'
import { Menu, Skeleton } from 'antd'
import { Operation, isOperationGroup, OperationGroup } from '@cxbox-ui/core'
import { ClickParam } from 'antd/lib/menu'
import { useTranslation } from 'react-i18next'
import styles from './RowOperationsMenu.less'
import { FrownOutlined } from '@ant-design/icons'

/**
 * {@link RowOperationsMenu | RowOperationsMenu} properties
 */
interface RowOperationsMenuProps {
    /**
     * Callback when selecting an operation
     */
    onSelect: (operationKey: string) => void
    operations?: Array<Operation | OperationGroup>
    loading?: boolean
}

/**
 * Menu with available record operations
 *
 * On operation selection dispatches {@link ActionPayloadTypes.sendOperation | sendOperation}
 *
 * @param props - Component properties
 */
export const RowOperationsMenu: React.FC<RowOperationsMenuProps> = ({ loading, operations, onSelect, ...rest }) => {
    const { t } = useTranslation()

    const handleClick = useCallback(
        (param: ClickParam) => {
            onSelect(param.key)
        },
        [onSelect]
    )

    const menuItem = useCallback(
        (item: Operation) => (
            <Menu.Item key={item.type} onClick={handleClick}>
                {item.icon && <FrownOutlined />}
                {item.text}
            </Menu.Item>
        ),
        [handleClick]
    )

    const menuItemList = operations.map(item => {
        if (isOperationGroup(item)) {
            return (
                <Menu.ItemGroup key={item.type || item.text} title={item.text}>
                    {item.actions.map(menuItem)}
                </Menu.ItemGroup>
            )
        }
        return menuItem(item)
    })

    const displayedItems = operations?.length ? menuItemList : <Menu.Item disabled>{t('No operations available')}</Menu.Item>

    return <Menu {...rest}>{loading ? <Skeleton active className={styles.skeleton} /> : displayedItems}</Menu>
}

export default memo(RowOperationsMenu)
