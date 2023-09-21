import React from 'react'
import { Operation, OperationGroup } from '@cxbox-ui/core/interfaces/operation'
import { Dropdown, Icon, Menu } from 'antd'
import styles from './OperationsGroup.less'
import { removeRecordOperationWidgets } from '../../../interfaces/widget'
import { WidgetTypes } from '@cxbox-ui/core/interfaces/widget'
import Button from '../../ui/Button/Button'

interface OperationsGroupProps {
    group: OperationGroup
    onClick: (operation: Operation) => void
    widgetType: WidgetTypes | string
}

function OperationsGroup({ group, widgetType, onClick }: OperationsGroupProps) {
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
            <Button key={group.text} data-test-widget-action-group={true}>
                <Icon type={group.icon} />
                {group.text}
            </Button>
        </Dropdown>
    )
}

export default React.memo(OperationsGroup)
