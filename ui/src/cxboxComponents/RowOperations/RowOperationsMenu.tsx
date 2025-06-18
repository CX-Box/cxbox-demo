import React from 'react'
import { Icon, Menu, Skeleton, Spin } from 'antd'
import styles from './RowOperationsMenu.less'
import { useAppDispatch, useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import { actions, interfaces } from '@cxbox-ui/core'
import { MenuProps } from 'antd/es/menu'
import { buildBcUrl } from '@utils/buildBcUrl'

const { isOperationGroup } = interfaces

/**
 * {@link RowOperationsMenu | RowOperationsMenu} properties
 */
interface RowOperationsMenuProps {
    /**
     * Widget meta description
     */
    meta: interfaces.WidgetMeta
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
export const RowOperationsMenu = ({ meta, bcName: hierarchyBc, onSelect, ...rest }: RowOperationsMenuProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const bcName = hierarchyBc || meta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const loading = useAppSelector(state => !!state.view.metaInProgress[meta.bcName])
    /**
     * Operations from row meta
     */
    const operations = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl]?.actions)
    /**
     * Filter operations based on widget settings
     */
    const operationList = useWidgetOperations(operations, meta, bcName)
    const isOperationInProgress = useOperationInProgress(bcName)

    const handleClick: MenuProps['onClick'] = React.useCallback(
        param => {
            dispatch(actions.sendOperation({ bcName, operationType: param.key, widgetName: meta.name }))
            onSelect?.(param.key)
        },
        [meta.name, bcName, onSelect, dispatch]
    )

    const menuItem = React.useCallback(
        (item: interfaces.Operation) => {
            const inProgress = isOperationInProgress(item.type)

            return (
                <Menu.Item key={item.type} data-test-widget-list-row-action-item={true} disabled={inProgress} onClick={handleClick}>
                    <Spin spinning={inProgress}>
                        {item.icon && <Icon type={item.icon} />}
                        {item.text}
                    </Spin>
                </Menu.Item>
            )
        },
        [handleClick, isOperationInProgress]
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

    return (
        <Menu {...rest}>
            {loading ? (
                <div data-test-loading={true}>
                    <Skeleton active className={styles.skeleton} />
                </div>
            ) : (
                displayedItems
            )}
        </Menu>
    )
}

export default React.memo(RowOperationsMenu)
