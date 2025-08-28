import React from 'react'
import { Operation, OperationGroup, OperationType, WidgetTypes } from '@cxbox-ui/core'
import { Dropdown, Icon, Menu, Spin } from 'antd'
import styles from './OperationsGroup.less'
import { removeRecordOperationWidgets } from '@interfaces/widget'
import Button from '../../ui/Button/Button'

interface OperationsGroupProps {
    group: OperationGroup
    onClick: (operation: Operation) => void
    widgetType: WidgetTypes | string
    loading?: boolean
    getButtonProps?: (operation: Operation) => { disabled?: boolean }
    isOperationInProgress: (operationType?: OperationType) => boolean
}

function OperationsGroup({ group, widgetType, onClick, loading, getButtonProps, isOperationInProgress }: OperationsGroupProps) {
    const operations = group.actions.filter(i => !(removeRecordOperationWidgets.includes(widgetType) && i.scope === 'record'))

    if (!operations.length) {
        return null
    }

    const operationsMenu = (
        <div className={styles.overlayContainer}>
            <Menu selectable={false}>
                {operations.map(operation => {
                    const inProgress = isOperationInProgress(operation.type)

                    return (
                        <Menu.Item
                            key={operation.type}
                            className={styles.subOperation}
                            data-test-widget-action-item={true}
                            onClick={() => !inProgress && onClick(operation)}
                            {...getButtonProps?.(operation)}
                        >
                            <Spin spinning={inProgress}>
                                {operation.icon && <Icon type={operation.icon} />}
                                {operation.text}
                            </Spin>
                        </Menu.Item>
                    )
                })}
            </Menu>
        </div>
    )

    return (
        <Dropdown trigger={['click']} overlay={operationsMenu} getPopupContainer={element => element.parentElement as HTMLElement}>
            <Button key={group.text} data-test-widget-action-group={true} loading={loading}>
                <Icon type={group.icon} />
                {group.text}
            </Button>
        </Dropdown>
    )
}

export default React.memo(OperationsGroup)
