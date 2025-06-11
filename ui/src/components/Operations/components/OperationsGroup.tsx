import React from 'react'
import { Operation, OperationGroup, WidgetTypes } from '@cxbox-ui/core'
import { Dropdown, Icon, Menu } from 'antd'
import styles from './OperationsGroup.less'
import { removeRecordOperationWidgets } from '@interfaces/widget'
import Button, { ButtonProps } from '../../ui/Button/Button'

interface OperationsGroupProps extends Pick<ButtonProps, 'bgColor'> {
    group: OperationGroup
    onClick: (operation: Operation) => void
    widgetType: WidgetTypes | string
    loading?: boolean
}

function OperationsGroup({ group, widgetType, onClick, loading, bgColor }: OperationsGroupProps) {
    const operations = group.actions.filter(i => !(removeRecordOperationWidgets.includes(widgetType) && i.scope === 'record'))
    if (!operations.length) {
        return null
    }
    const operationsMenu = (
        <div className={styles.overlayContainer}>
            <Menu>
                {operations.map(operation => {
                    return (
                        <Menu.Item
                            key={operation.type}
                            className={styles.subOperation}
                            data-test-widget-action-item={true}
                            onClick={() => onClick(operation)}
                        >
                            {operation.icon && <Icon type={operation.icon} />}
                            {operation.text}
                        </Menu.Item>
                    )
                })}
            </Menu>
        </div>
    )

    return (
        <Dropdown trigger={['click']} overlay={operationsMenu} getPopupContainer={element => element.parentElement as HTMLElement}>
            <Button key={group.text} data-test-widget-action-group={true} bgColor={bgColor} loading={loading}>
                <Icon type={group.icon} />
                {group.text}
            </Button>
        </Dropdown>
    )
}

export default React.memo(OperationsGroup)
