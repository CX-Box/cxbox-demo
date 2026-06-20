import React from 'react'
import { Icon, Menu, Spin } from 'antd'
import { useAppDispatch, useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import { actions, isOperationGroup, Operation } from '@cxbox-ui/core'
import { MenuProps } from 'antd/es/menu'
import { AppWidgetMeta } from '@interfaces/widget'
import { selectBcMetaInProgress } from '@selectors/selectors'

interface RowOperationsMenuProps {
    widget: AppWidgetMeta
    onSelect?: (operationKey: string) => void
}

export const RowOperationsMenu = ({ widget, onSelect, ...rest }: RowOperationsMenuProps) => {
    const { t } = useTranslation()

    const loading = useAppSelector(selectBcMetaInProgress(widget.bcName))
    const operations = useWidgetOperations(widget.name, ['record'], false)
    const isOperationInProgress = useOperationInProgress(widget.bcName)

    const dispatch = useAppDispatch()

    const handleClick: MenuProps['onClick'] = React.useCallback(
        param => {
            dispatch(actions.sendOperation({ bcName: widget.bcName, operationType: param.key, widgetName: widget.name }))
            onSelect?.(param.key)
        },
        [dispatch, widget.bcName, widget.name, onSelect]
    )

    const menuItem = React.useCallback(
        (item: Operation) => {
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

    const menuItemList = operations
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

    return (
        <Spin spinning={loading} data-test-loading={true}>
            <Menu {...rest}>{menuItemList.length ? menuItemList : <Menu.Item disabled>{t('No operations available')}</Menu.Item>}</Menu>
        </Spin>
    )
}

export default React.memo(RowOperationsMenu)
