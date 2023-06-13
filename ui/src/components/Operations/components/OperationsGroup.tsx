import React from 'react'
import { Operation, OperationGroup } from '@cxbox-ui/core/interfaces/operation'
import { Dropdown, Menu } from 'antd'
import OperationButton from '../../ui/OperationButton/OperationButton'
import styles from './OperationsGroup.module.css'
import { removeRecordOperationWidgets } from '../../../interfaces/widget'
import { WidgetTypes } from '@cxbox-ui/core/interfaces/widget'
import { FrownOutlined } from '@ant-design/icons'

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
                        <Menu.Item key={operation.type} className={styles.subOperation} onClick={() => onClick(operation)}>
                            {operation.icon && <FrownOutlined />}
                            {operation.text}
                        </Menu.Item>
                    )
                })}
            </Menu>
        </div>
    )

    return (
        <Dropdown trigger={['click']} overlay={operationsMenu} getPopupContainer={element => element.parentElement as HTMLElement}>
            <OperationButton key={group.text}>
                <FrownOutlined />
                {group.text}
            </OperationButton>
        </Dropdown>
    )
}

export default React.memo(OperationsGroup)
