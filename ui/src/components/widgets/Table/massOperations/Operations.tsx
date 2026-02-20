import React, { useCallback } from 'react'
import Button from '@components/ui/Button/Button'
import { useTranslation } from 'react-i18next'
import { Dropdown, Icon, Menu, Tooltip } from 'antd'
import {
    isMassOperationGroup,
    MassAdditionalOperation,
    MassAdditionalOperationGroup,
    MassOperationType,
    operationGroupHasSettingMode
} from '@components/widgets/Table/massOperations/constants'
import styles from './Operations.module.less'
import DropdownSetting from '@components/widgets/Table/components/DropdownSetting'
import { filterByConditions } from '@utils/filterByConditions'
import Tags, { TagsProps } from '@components/ui/Tags/Tags'

export interface OperationsProps extends Partial<TagsProps> {
    operations: Array<MassAdditionalOperation | MassAdditionalOperationGroup>
    getOperationProps?: (buttonType: MassOperationType) => {
        disabled?: boolean
        hidden?: boolean
        hint?: string
        onClick?: () => void
    }
}

const Operations: React.FC<OperationsProps> = ({ operations, getOperationProps, onAllClose, onClose, tags, maxTagsCount, maxTagsHint }) => {
    const { t } = useTranslation()

    const isSettingGroupMode = useCallback((operationOrGroup: MassAdditionalOperation | MassAdditionalOperationGroup) => {
        return isMassOperationGroup(operationOrGroup) && operationGroupHasSettingMode(operationOrGroup)
    }, [])

    const [settingOperations, otherOperations] = filterByConditions(operations, [
        operationOrGroup => isSettingGroupMode(operationOrGroup)
    ]) as [MassAdditionalOperationGroup[], Array<MassAdditionalOperation | MassAdditionalOperationGroup>]

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

    const isVisibleOperation = (operation: MassAdditionalOperation) => !{ ...operation, ...getOperationProps?.(operation.type) }.hidden

    const hasVisibleOperationsInGroups = (group: MassAdditionalOperationGroup) => group.actions.some(isVisibleOperation)

    const setting = settingOperations.some(hasVisibleOperationsInGroups) && (
        <DropdownSetting
            buttonIcon={'menu'}
            buttonClassName={styles.setting}
            overlay={
                <Menu>
                    {settingOperations.map(group => {
                        const menuItems = group.actions.map(getMenuItem)

                        if (hasVisibleOperationsInGroups(group) && group.groupTitle) {
                            return (
                                <Menu.ItemGroup key={group.type} title={t(group.groupTitle)}>
                                    {menuItems}
                                </Menu.ItemGroup>
                            )
                        }

                        return menuItems
                    })}
                </Menu>
            }
        />
    )

    const hideTags = !tags?.length || !onClose

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
                {otherOperations.map((operationOrGroup, i) => {
                    if (isMassOperationGroup(operationOrGroup)) {
                        const group = operationOrGroup
                        const groupProps = getOperationProps?.(group.type)
                        const hint = groupProps?.hint ?? group.hint
                        delete groupProps?.['hint']

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
                                        key={group.text}
                                        type={group.buttonType}
                                        icon={group.icon}
                                        removeIndentation={group.buttonType === 'link'}
                                        hidden={group.hidden}
                                        disabled={group.disabled}
                                        {...groupProps}
                                    >
                                        {t(group.text ?? '')}
                                    </Button>
                                </Tooltip>
                            </Dropdown>
                        ) : null
                    }

                    const operation = operationOrGroup
                    const operationProps = getOperationProps?.(operation.type)
                    const hint = operationProps?.hint ?? operation.hint
                    delete operationProps?.['hint']

                    return (
                        <Tooltip key={operation.type} trigger="hover" title={hint && t(hint)}>
                            <Button
                                key={operation.type}
                                icon={operation.icon}
                                type={operation.buttonType}
                                removeIndentation={operation.buttonType === 'link'}
                                hidden={operation.hidden}
                                disabled={operation.disabled}
                                {...operationProps}
                            >
                                {t(operation.text ?? '')}
                            </Button>
                        </Tooltip>
                    )
                })}
                {hideTags ? setting : null}
            </div>
            {!hideTags && (
                <Tags onClose={onClose} tags={tags} maxTagsCount={maxTagsCount} onAllClose={onAllClose} maxTagsHint={maxTagsHint}>
                    {setting}
                </Tags>
            )}
        </>
    )
}

export default React.memo(Operations)
