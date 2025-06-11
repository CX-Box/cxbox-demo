import React, { ReactNode, useEffect, useRef } from 'react'
import { actions, isOperationGroup, WidgetTypes } from '@cxbox-ui/core'
import { Icon } from 'antd'
import { useAppSelector } from '@store'
import styles from './Operations.less'
import { useDispatch } from 'react-redux'
import OperationsGroup from './components/OperationsGroup'
import { AppWidgetMeta, OperationCustomMode, OperationInfo, removeRecordOperationWidgets } from '@interfaces/widget'
import Button, { customTypes } from '../ui/Button/Button'
import cn from 'classnames'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import TextSearchInput from '@components/Operations/components/TextSearchInput/TextSearchInput'
import { FileUpload } from '@components/Operations/components/FileUpload/FileUpload'
import { selectBcUrlRowMeta } from '@selectors/selectors'
import { Operation, OperationGroup } from '@interfaces/rowMeta'

export interface OperationsOwnProps {
    className?: string
    bcName: string
    widgetMeta: AppWidgetMeta
    operations: Array<Operation | OperationGroup>
    additionalOperations?: ReactNode
}

function Operations(props: OperationsOwnProps) {
    const { bcName, widgetMeta, operations, className, additionalOperations } = props
    const metaInProgress = useAppSelector(state => state.view.metaInProgress[bcName])

    const { defaultOperations, customOperations, isUploadDnDMode } = useWidgetOperationsMode(widgetMeta, operations)
    const cachedOperations = useOperationsCache(defaultOperations, bcName)

    const dispatch = useDispatch()

    const handleOperationClick = React.useCallback(
        (operation: Operation) => {
            dispatch(
                actions.sendOperation({
                    bcName,
                    operationType: operation.type,
                    widgetName: widgetMeta.name,
                    bcKey: operation.bcKey,
                    confirmOperation: operation.preInvoke
                })
            )
        },
        [dispatch, bcName, widgetMeta]
    )

    return (
        <div className={styles.container}>
            {customOperations?.map(customOperation => {
                if (isUploadDnDMode(customOperation.mode)) {
                    return <FileUpload key={customOperation.actionKey} widget={widgetMeta} operationInfo={customOperation} mode="drag" />
                }

                return null
            })}
            <div className={cn(styles.operations, className, { [styles.empty]: !defaultOperations?.length })}>
                {cachedOperations.map((item: Operation | OperationGroup, index) => {
                    if (isOperationGroup(item)) {
                        return (
                            <OperationsGroup
                                key={item.type}
                                group={item}
                                widgetType={widgetMeta.type}
                                onClick={handleOperationClick}
                                loading={metaInProgress}
                                bgColor={item.customParameter?.platformBgColor}
                            />
                        )
                    }

                    if (item.subtype === 'multiFileUpload') {
                        const operationInfo: OperationInfo = widgetMeta.options?.buttons?.find(
                            button => button.actionKey === item.type
                        ) ?? {
                            actionKey: item.type
                        }
                        return (
                            <FileUpload key={item.type} widget={widgetMeta} operationInfo={operationInfo} mode="default">
                                <Button
                                    key={item.type}
                                    data-test-widget-action-item={true}
                                    type={getButtonType({
                                        widgetType: widgetMeta.type,
                                        index,
                                        bgColor: item.customParameter?.platformBgColor
                                    })}
                                    loading={metaInProgress}
                                    bgColor={item.customParameter?.platformBgColor}
                                >
                                    {item.icon && <Icon type={item.icon} />}
                                    {item.text}
                                </Button>
                            </FileUpload>
                        )
                    }

                    return removeRecordOperationWidgets.includes(widgetMeta.type) && item.scope === 'record' ? null : (
                        <Button
                            key={item.type}
                            data-test-widget-action-item={true}
                            type={getButtonType({
                                widgetType: widgetMeta.type,
                                index,
                                bgColor: item.customParameter?.platformBgColor
                            })}
                            onClick={() => handleOperationClick(item)}
                            loading={metaInProgress}
                            bgColor={item.customParameter?.platformBgColor}
                        >
                            {item.icon && <Icon type={item.icon} />}
                            {item.text}
                        </Button>
                    )
                })}
                <div className={styles.operationsLeftBlock}>
                    {widgetMeta.options?.fullTextSearch?.enabled && (
                        <TextSearchInput
                            bcName={bcName}
                            widgetName={widgetMeta.name}
                            placeholder={widgetMeta.options?.fullTextSearch?.placeholder}
                        />
                    )}
                    {additionalOperations}
                </div>
            </div>
        </div>
    )
}

export default React.memo(Operations)

const getButtonType = ({
    widgetType,
    index,
    defaultType,
    bgColor
}: {
    widgetType?: string
    defaultType?: string
    index: number
    bgColor?: string
}) => {
    if (bgColor) {
        return customTypes.customDefault
    }

    const isFormWidget = widgetType === WidgetTypes.Form

    if (isFormWidget && index !== 0) {
        return customTypes.formOperation
    }

    if (isFormWidget && index === 0) {
        return customTypes.formOperationRed
    }

    return defaultType
}

const CUSTOM_COMBINED_WITH_DEFAULT_MODE: OperationCustomMode[] = ['default-and-file-upload-dnd']
const FILE_UPLOAD_DND_MODE: OperationCustomMode[] = ['default-and-file-upload-dnd', 'file-upload-dnd']

const useWidgetOperationsMode = (widget: AppWidgetMeta, operations: (Operation | OperationGroup)[]) => {
    const customOperations = widget.options?.buttons?.filter(button => button.actionKey && button.mode?.length && button.mode !== 'default')

    const customOperationsWithoutDefaultMode = customOperations
        ?.filter(button => !CUSTOM_COMBINED_WITH_DEFAULT_MODE.includes(button.mode as OperationCustomMode))
        .map(button => button.actionKey)

    const defaultOperations = useWidgetOperations(operations, widget).filter(
        item => !customOperationsWithoutDefaultMode?.includes(item.type as string)
    )

    const isUploadDnDMode = (mode?: OperationCustomMode | string) => {
        return FILE_UPLOAD_DND_MODE.includes(mode as OperationCustomMode)
    }

    return {
        defaultOperations,
        customOperations,
        isUploadDnDMode
    }
}
/**
 *  Решает проблему с потерей состояния FileUpload из-за metaInProgress, исчезновения rowMeta при перезагрузке страницы и хука useWidgetOperations, который всегда возвращает массив вместо undefined.
 */
const useOperationsCache = (operations: (OperationGroup | Operation)[], bcName: string) => {
    const metaInProgress = useAppSelector(state => state.view.metaInProgress[bcName])
    const rowMeta = useAppSelector(state => selectBcUrlRowMeta(state, bcName))

    const cached = useRef<(OperationGroup | Operation)[] | null>(null)

    useEffect(() => {
        if (!metaInProgress) {
            cached.current = operations ?? null
        }
    }, [operations, metaInProgress])

    if (!rowMeta && metaInProgress && cached.current) {
        return cached.current
    }

    return operations
}
