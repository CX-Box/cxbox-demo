import React, { useCallback } from 'react'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { Dropdown, Icon, Menu, Tooltip } from 'antd'
import styles from './Operations.module.less'
import { isOperationGroup, Operation, OperationGroup } from '@cxbox-ui/core'

type DynamicOperationProps = {
    disabled?: boolean
    hidden?: boolean
    hint?: string
    onClick?: () => void
}

export interface OperationsProps {
    operations: Array<Operation | OperationGroup>
    getOperationProps?: (buttonType: string) => DynamicOperationProps
}

const ONLY_ICON = true

const Operations: React.FC<OperationsProps> = ({ operations, getOperationProps }) => {
    const { t } = useTranslation()

    const getMenuItem = useCallback(
        operation => {
            const operationProps = getOperationProps?.(operation.type)
            const hint = operationProps?.hint ?? operation.hint
            delete operationProps?.['hint']

            return (
                <Menu.Item
                    key={operation.type}
                    className={styles.subOperation}
                    hidden={operation.hidden}
                    disabled={operation.disabled}
                    {...operationProps}
                >
                    <Tooltip trigger="hover" title={hint && t(hint)}>
                        <div>
                            {operation.icon && <Icon type={operation.icon} />}
                            {t(operation.text ?? '')}
                        </div>
                    </Tooltip>
                </Menu.Item>
            )
        },
        [getOperationProps, t]
    )

    const isVisibleOperation = (operation: Operation) => !{ ...operation, ...getOperationProps?.(operation.type) }.hidden

    const hasVisibleOperationsInGroups = (group: OperationGroup) => group.actions.some(isVisibleOperation)

    return (
        <>
            {operations.map((operationOrGroup, i) => {
                if (isOperationGroup(operationOrGroup)) {
                    const group = operationOrGroup
                    const groupProps = getOperationProps?.(group.type as string)
                    const hint = groupProps?.hint
                    delete groupProps?.['hint']
                    const text = !ONLY_ICON && t(group.text ?? '')

                    return hasVisibleOperationsInGroups(group) ? (
                        <Dropdown
                            key={group.type}
                            trigger={['click']}
                            overlay={
                                <div className={styles.overlayContainer}>
                                    <Menu>{group.actions.map(getMenuItem)}</Menu>
                                </div>
                            }
                            getPopupContainer={element => element.parentElement as HTMLElement}
                        >
                            <Tooltip trigger="hover" title={hint && t(hint)}>
                                <Button
                                    className={styles.button}
                                    key={group.text}
                                    type="default"
                                    icon={group.icon}
                                    removeIndentation={!text}
                                    {...groupProps}
                                >
                                    {text}
                                </Button>
                            </Tooltip>
                        </Dropdown>
                    ) : null
                }

                const operation = operationOrGroup
                const operationProps = getOperationProps?.(operation.type)
                const hint = operationProps?.hint
                delete operationProps?.['hint']
                const text = !ONLY_ICON && t(operation.text ?? '')

                return (
                    <Tooltip key={operation.type} trigger="hover" title={hint && t(hint)}>
                        <Button
                            className={styles.button}
                            key={operation.type}
                            icon={operation.icon}
                            type="default"
                            removeIndentation={!text}
                            {...operationProps}
                        >
                            {text}
                        </Button>
                    </Tooltip>
                )
            })}
        </>
    )
}

export default React.memo(Operations)
