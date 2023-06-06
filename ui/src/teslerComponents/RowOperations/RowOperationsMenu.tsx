import React from 'react'
import { Menu, Icon, Skeleton } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { Store } from '@interfaces/store'
import { ClickParam } from 'antd/lib/menu'
import { useTranslation } from 'react-i18next'
import styles from './RowOperationsMenu.less'
import { WidgetMeta } from '@tesler-ui/core'
import { buildBcUrl, useWidgetOperations } from '@tesler-ui/core'
import { $do } from '@actions/types'
import { isOperationGroup, Operation } from '@tesler-ui/core'

/**
 * {@link RowOperationsMenu | RowOperationsMenu} properties
 */
interface RowOperationsMenuProps {
    /**
     * Widget meta description
     */
    meta: WidgetMeta
    /**
     * Use when business component differs from widget's (e.g. hierarchies nested level)
     */
    bcName?: string
    /**
     * Callback when selecting an operation
     */
    onSelect?: (operationKey: string) => void
}

/**
 * Menu with available record operations
 *
 * On operation selection dispatches {@link ActionPayloadTypes.sendOperation | sendOperation}
 *
 * @param props - Component properties
 */
export const RowOperationsMenu: React.FC<RowOperationsMenuProps> = ({ meta, bcName: hierarchyBc, onSelect, ...rest }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const bcName = hierarchyBc || meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const loading = useSelector((store: Store) => !!store.view.metaInProgress[meta.bcName])
    /**
     * Operations from row meta
     */
    const operations = useSelector((store: Store) => store.view.rowMeta[bcName]?.[bcUrl]?.actions)
    /**
     * Filter operations based on widget settings
     */
    const operationList = useWidgetOperations(operations, meta, bcName)

    const handleClick = React.useCallback(
        (param: ClickParam) => {
            dispatch($do.sendOperation({ bcName, operationType: param.key, widgetName: meta.name }))
            onSelect?.(param.key)
        },
        [meta.name, bcName, onSelect, dispatch]
    )

    const menuItem = React.useCallback(
        (item: Operation) => (
            <Menu.Item key={item.type} onClick={handleClick}>
                {item.icon && <Icon type={item.icon} />}
                {item.text}
            </Menu.Item>
        ),
        [handleClick]
    )

    const menuItemList = operationList
        .map(item => {
            if (isOperationGroup(item)) {
                return (
                    <Menu.ItemGroup key={item.type || item.text} title={item.text}>
                        {item.actions.filter(operation => operation.scope === 'record').map(menuItem)}
                    </Menu.ItemGroup>
                )
            }
            return item.scope === 'record' ? menuItem(item) : null
        })
        .filter(item => !!item)
    const displayedItems = menuItemList.length ? menuItemList : <Menu.Item disabled>{t('No operations available')}</Menu.Item>

    return <Menu {...rest}>{loading ? <Skeleton active className={styles.skeleton} /> : displayedItems}</Menu>
}

export default React.memo(RowOperationsMenu)
