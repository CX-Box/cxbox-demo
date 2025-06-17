import React from 'react'
import { Dropdown, Icon, Menu, Spin } from 'antd'
import Button from '../../ui/Button/Button'
import { Operation, OperationGroup, OperationType, WidgetTypes } from '@cxbox-ui/core'
import { removeRecordOperationWidgets } from '@interfaces/widget'
import styles from './OperationsGroup.less'

interface OperationsGroupProps {
    group: OperationGroup
    onClick: (operation: Operation) => void
    widgetType: WidgetTypes | string
    loading?: boolean
    isOperationInProgress: (operationType?: OperationType) => boolean
}

function OperationsGroup({ group, widgetType, onClick, loading, isOperationInProgress }: OperationsGroupProps) {
    const operations = group.actions.filter(i => !(removeRecordOperationWidgets.includes(widgetType) && i.scope === 'record'))

    if (!operations.length) {
        return null
    }

    const operationsMenu = (
        <div className={styles.overlayContainer}>
            <Menu>
                {operations.map(operation => {
                    const inProgress = isOperationInProgress(operation.type)

                    return (
                        <Menu.Item
                            key={operation.type}
                            className={styles.subOperation}
                            data-test-widget-action-item={true}
                            onClick={() => !inProgress && onClick(operation)}
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
