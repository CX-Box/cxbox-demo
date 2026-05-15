import React, { useCallback, useMemo, useState } from 'react'
import { Icon, Menu, Modal, Skeleton, Spin } from 'antd'
import styles from './RowOperationsMenu.less'
import { useAppDispatch, useAppSelector } from '@store'
import { useTranslation } from 'react-i18next'
import { useWidgetOperationsOld } from '@hooks/useWidgetOperations'
import { useOperationInProgress } from '@hooks/useOperationInProgress'
import { actions, interfaces, isOperationGroup } from '@cxbox-ui/core'
import { MenuProps } from 'antd/es/menu'
import { buildBcUrl } from '@utils/buildBcUrl'
import { AppWidgetMeta } from '@interfaces/widget'
import CryptoGeneratorContent from '@components/CryptoGeneratorContent/CryptoGeneratorContent'
import { selectBcMetaInProgress } from '@selectors/selectors'
/**
 * {@link RowOperationsMenu | RowOperationsMenu} properties
 */
interface RowOperationsMenuProps {
    /**
     * Widget meta description
     */
    meta: AppWidgetMeta
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
export const RowOperationsMenu = ({ meta: widgetMeta, bcName: hierarchyBc, onSelect, ...rest }: RowOperationsMenuProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const bcName = hierarchyBc || widgetMeta.bcName
    const bcUrl = buildBcUrl(bcName, true)
    const loading = useAppSelector(selectBcMetaInProgress(widgetMeta.bcName))

    const isCryptoOperation = useCallback(
        (operationType: string) => {
            return widgetMeta?.options?.cryptoGenerator?.find(generatorOptions => generatorOptions.actionName === operationType)
        },
        [widgetMeta?.options?.cryptoGenerator]
    )

    const [activeSignOperation, setActiveSignOperation] = useState<string | null>(null)

    const isOpenSingModal = !!activeSignOperation

    const clearActiveSignOperation = useCallback(() => {
        setActiveSignOperation(null)
    }, [])

    /**
     * Operations from row meta
     */
    const operations = useAppSelector(state => state.view.rowMeta[bcName]?.[bcUrl]?.actions)
    /**
     * Filter operations based on widget settings
     */
    const operationList = useWidgetOperationsOld(operations, widgetMeta, bcName)
    const isOperationInProgress = useOperationInProgress(bcName)

    const handleClick: MenuProps['onClick'] = React.useCallback(
        param => {
            const operationType = param.key

            if (isCryptoOperation(operationType)) {
                setActiveSignOperation(operationType)
            } else {
                dispatch(actions.sendOperation({ bcName, operationType, widgetName: widgetMeta.name }))
            }
            onSelect?.(operationType)
        },
        [isCryptoOperation, onSelect, dispatch, bcName, widgetMeta.name]
    )

    const cryptoGeneratorModal = useMemo(() => {
        return (
            isOpenSingModal && (
                <Modal visible onCancel={clearActiveSignOperation} footer={null}>
                    <CryptoGeneratorContent meta={widgetMeta} operationType={activeSignOperation} onClose={clearActiveSignOperation} />
                </Modal>
            )
        )
    }, [activeSignOperation, clearActiveSignOperation, isOpenSingModal, widgetMeta])

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
        <>
            {cryptoGeneratorModal}
            <Menu {...rest}>
                {loading ? (
                    <div data-test-loading={true}>
                        <Skeleton active className={styles.skeleton} />
                    </div>
                ) : (
                    displayedItems
                )}
            </Menu>
        </>
    )
}

export default React.memo(RowOperationsMenu)
